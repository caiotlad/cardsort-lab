package br.com.cardsortlab.web;

import br.com.cardsortlab.domain.*;
import br.com.cardsortlab.repository.*;
import br.com.cardsortlab.service.StudyMapper;
import br.com.cardsortlab.web.StudyDtos.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.security.SecureRandom;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/studies")
public class StudyController {
    private final StudyRepository studies;
    private final UserRepository users;
    private final SessionRepository sessions;
    private final StudyMapper mapper;
    private final ObjectMapper json;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String COLORS[] = {"#5a7cf8","#22c88a","#f59e0b","#a78bfa","#fb7185","#38bdf8"};
    private static final DateTimeFormatter EXPORT_DATE = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.of("America/Sao_Paulo"));

    public StudyController(StudyRepository studies, UserRepository users, SessionRepository sessions,
                           StudyMapper mapper, ObjectMapper json) {
        this.studies = studies;
        this.users = users;
        this.sessions = sessions;
        this.mapper = mapper;
        this.json = json;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<StudyResponse> list(Authentication auth) {
        return studies.findByOwnerIdOrderByUpdatedAtDesc(auth.getName()).stream()
                .map(s -> mapper.toResponse(s, true)).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public StudyResponse get(@PathVariable String id, Authentication auth) {
        return mapper.toResponse(owned(id, auth), true);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<StudyResponse> create(@Valid @RequestBody StudyRequest request, Authentication auth) {
        var study = new Study();
        study.setOwner(users.findById(auth.getName()).orElseThrow());
        apply(study, request);
        study.setAccessCode(generateCode());
        study.setShareToken(UUID.randomUUID().toString().replace("-", ""));
        validate(study);
        studies.save(study);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(study, true));
    }

    @PutMapping("/{id}")
    @Transactional
    public StudyResponse update(@PathVariable String id, @Valid @RequestBody StudyRequest request, Authentication auth) {
        var study = owned(id, auth);
        study.getCards().clear();
        study.getCategories().clear();
        apply(study, request);
        validate(study);
        return mapper.toResponse(studies.save(study), true);
    }

    @PatchMapping("/{id}/privacy")
    @Transactional
    public StudyResponse privacy(@PathVariable String id, @RequestBody Map<String, Boolean> body, Authentication auth) {
        var study = owned(id, auth);
        study.setDashboardPrivate(body.getOrDefault("isPrivate", !study.isDashboardPrivate()));
        return mapper.toResponse(studies.save(study), true);
    }

    @GetMapping(value = "/{id}/exports/summary.csv", produces = "text/csv; charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> exportSummary(@PathVariable String id, Authentication auth) {
        var study = owned(id, auth);
        var completed = completedSessions(study);
        int totalTime = completed.stream().mapToInt(s -> s.getTimeSpent() == null ? 0 : s.getTimeSpent()).sum();
        int avgTime = completed.isEmpty() ? 0 : Math.round((float) totalTime / completed.size());
        var rows = new ArrayList<List<String>>();
        rows.add(List.of("Campo", "Valor"));
        rows.add(List.of("Nome", study.getName()));
        rows.add(List.of("Descrição", study.getDescription()));
        rows.add(List.of("Tipo", study.getType().name().toLowerCase()));
        rows.add(List.of("Status", study.getStatus().name().toLowerCase()));
        rows.add(List.of("Criado em", EXPORT_DATE.format(study.getCreatedAt())));
        rows.add(List.of("Cards", String.valueOf(study.getCards().size())));
        rows.add(List.of("Categorias", String.valueOf(study.getCategories().size())));
        rows.add(List.of("Sessões concluídas", String.valueOf(completed.size())));
        rows.add(List.of("Tempo médio (s)", String.valueOf(avgTime)));
        rows.add(List.of("Instruções", study.getInstructions()));
        return csv(csv(rows), safeFileName(study.getName()) + "_resumo.csv");
    }

    @GetMapping(value = "/{id}/exports/sessions.csv", produces = "text/csv; charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> exportSessions(@PathVariable String id, Authentication auth) {
        var study = owned(id, auth);
        var rows = new ArrayList<List<String>>();
        rows.add(List.of("ID Sessão", "Participante", "E-mail", "Data/Hora", "Tempo (s)",
                "Nº Grupos", "Categoria", "Cards no Grupo"));
        for (var session : completedSessions(study)) {
            for (var group : groups(session)) {
                rows.add(List.of(
                        session.getId(),
                        session.getParticipantName(),
                        session.getParticipantEmail() == null ? "" : session.getParticipantEmail(),
                        session.getCompletedAt() == null ? "" : EXPORT_DATE.format(session.getCompletedAt()),
                        String.valueOf(session.getTimeSpent() == null ? 0 : session.getTimeSpent()),
                        String.valueOf(groups(session).size()),
                        group.categoryName(),
                        cardNames(study, group.cardIds())
                ));
            }
        }
        return csv(csv(rows), safeFileName(study.getName()) + "_sessoes.csv");
    }

    @GetMapping(value = "/{id}/exports/similarity-matrix.csv", produces = "text/csv; charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> exportSimilarityMatrix(@PathVariable String id, Authentication auth) {
        var study = owned(id, auth);
        var matrix = similarityMatrix(study, completedSessions(study));
        var rows = new ArrayList<List<String>>();
        var header = new ArrayList<String>();
        header.add("Card");
        study.getCards().forEach(card -> header.add(card.getText()));
        rows.add(header);
        for (int i = 0; i < study.getCards().size(); i++) {
            var row = new ArrayList<String>();
            row.add(study.getCards().get(i).getText());
            for (int j = 0; j < study.getCards().size(); j++) {
                row.add(Math.round(matrix[i][j] * 100) + "%");
            }
            rows.add(row);
        }
        return csv(csv(rows), safeFileName(study.getName()) + "_matriz_similaridade.csv");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable String id, Authentication auth) {
        studies.delete(owned(id, auth));
    }

    private Study owned(String id, Authentication auth) {
        return studies.findByIdAndOwnerId(id, auth.getName())
                .orElseThrow(() -> new SecurityException("Estudo não encontrado ou sem permissão."));
    }

    private List<StudySession> completedSessions(Study study) {
        return sessions.findByStudyIdAndStatusOrderByStartedAtDesc(study.getId(), SessionStatus.COMPLETED);
    }

    private List<GroupResponse> groups(StudySession session) {
        try {
            return json.readValue(session.getGroupsJson(), new TypeReference<>() {});
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private String cardNames(Study study, List<String> cardIds) {
        var names = new ArrayList<String>();
        for (var cardId : cardIds) {
            names.add(study.getCards().stream()
                    .filter(card -> card.getId().equals(cardId))
                    .findFirst()
                    .map(CardItem::getText)
                    .orElse(cardId));
        }
        return String.join(" | ", names);
    }

    private double[][] similarityMatrix(Study study, List<StudySession> completed) {
        int n = study.getCards().size();
        double[][] matrix = new double[n][n];
        if (completed.isEmpty()) return matrix;
        var cardIndex = new HashMap<String, Integer>();
        for (int i = 0; i < study.getCards().size(); i++) {
            cardIndex.put(study.getCards().get(i).getId(), i);
        }
        for (var session : completed) {
            for (var group : groups(session)) {
                for (int i = 0; i < group.cardIds().size(); i++) {
                    for (int j = i + 1; j < group.cardIds().size(); j++) {
                        Integer a = cardIndex.get(group.cardIds().get(i));
                        Integer b = cardIndex.get(group.cardIds().get(j));
                        if (a != null && b != null) {
                            matrix[a][b] += 1;
                            matrix[b][a] += 1;
                        }
                    }
                }
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                matrix[i][j] = i == j ? 1 : matrix[i][j] / completed.size();
            }
        }
        return matrix;
    }

    private ResponseEntity<String> csv(String body, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body("\uFEFF" + body);
    }

    private String csv(List<List<String>> rows) {
        return rows.stream()
                .map(row -> row.stream().map(this::escapeCsv).reduce((a, b) -> a + ";" + b).orElse(""))
                .reduce((a, b) -> a + "\r\n" + b)
                .orElse("");
    }

    private String escapeCsv(String value) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private String safeFileName(String name) {
        return name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\p{IsAlphabetic}]+", "_")
                .replaceAll("^_+|_+$", "");
    }

    private void apply(Study study, StudyRequest request) {
        study.setName(request.name().trim());
        study.setDescription(request.description().trim());
        study.setInstructions(request.instructions().trim());
        study.setType(request.type());
        study.setAccessMode(request.accessMode() == null ? AccessMode.LINK : request.accessMode());
        study.setDashboardPrivate(request.dashboardPrivate() == null || request.dashboardPrivate());
        study.setAllowUncertainCategory(Boolean.TRUE.equals(request.allowUncertainCategory()));
        study.setTimerEnabled(request.timerEnabled() == null || request.timerEnabled());
        for (int i = 0; i < request.cards().size(); i++) {
            var source = request.cards().get(i);
            var card = new CardItem();
            if (source.id() != null && !source.id().isBlank()) card.setId(source.id());
            card.setText(source.text().trim());
            card.setExpectedCategoryId(source.expectedCategoryId());
            card.setPosition(i);
            study.getCards().add(card);
        }
        var requestedCategories = request.categories() == null ? List.<CategoryRequest>of() : request.categories();
        for (int i = 0; i < requestedCategories.size(); i++) {
            var source = requestedCategories.get(i);
            var category = new CategoryItem();
            if (source.id() != null && !source.id().isBlank()) category.setId(source.id());
            category.setName(source.name().trim());
            category.setFixed(source.fixed() == null || source.fixed());
            category.setColor(source.color() == null ? COLORS[i % COLORS.length] : source.color());
            category.setPosition(i);
            study.getCategories().add(category);
        }
    }

    private void validate(Study study) {
        if (study.getCards().size() < 2) throw new IllegalArgumentException("Adicione pelo menos dois cards.");
        if (study.getType() == SortingType.CLOSED && study.getCategories().isEmpty())
            throw new IllegalArgumentException("Card sorting fechado exige categorias pré-definidas.");
        if (study.getType() == SortingType.HYBRID && study.getCategories().isEmpty())
            throw new IllegalArgumentException("Card sorting híbrido exige ao menos uma categoria fixa.");
        if (study.getType() == SortingType.OPEN) study.getCategories().clear();
    }

    private String generateCode() {
        String code;
        do code = String.format("%06d", RANDOM.nextInt(1_000_000));
        while (studies.findByAccessCodeIgnoreCase(code).isPresent());
        return code;
    }
}
