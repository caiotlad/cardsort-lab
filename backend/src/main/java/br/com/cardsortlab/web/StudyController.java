package br.com.cardsortlab.web;

import br.com.cardsortlab.domain.*;
import br.com.cardsortlab.repository.*;
import br.com.cardsortlab.service.StudyMapper;
import br.com.cardsortlab.web.StudyDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.security.SecureRandom;
import java.util.*;

@RestController
@RequestMapping("/api/studies")
public class StudyController {
    private final StudyRepository studies;
    private final UserRepository users;
    private final StudyMapper mapper;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String COLORS[] = {"#5a7cf8","#22c88a","#f59e0b","#a78bfa","#fb7185","#38bdf8"};

    public StudyController(StudyRepository studies, UserRepository users, StudyMapper mapper) {
        this.studies = studies;
        this.users = users;
        this.mapper = mapper;
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
