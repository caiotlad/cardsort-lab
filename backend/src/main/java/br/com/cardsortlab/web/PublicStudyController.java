package br.com.cardsortlab.web;

import br.com.cardsortlab.domain.*;
import br.com.cardsortlab.repository.*;
import br.com.cardsortlab.service.StudyMapper;
import br.com.cardsortlab.web.StudyDtos.*;
import com.fasterxml.jackson.databind.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/public")
public class PublicStudyController {
    private final StudyRepository studies;
    private final SessionRepository sessions;
    private final StudyMapper mapper;
    private final ObjectMapper json;

    public PublicStudyController(StudyRepository studies, SessionRepository sessions,
                                 StudyMapper mapper, ObjectMapper json) {
        this.studies = studies;
        this.sessions = sessions;
        this.mapper = mapper;
        this.json = json;
    }

    public record StartRequest(@NotBlank String participantName, String participantEmail, String code) {}
    public record StartResponse(String sessionId, StudyResponse study, JsonNode draft, Instant startedAt) {}
    public record DraftRequest(JsonNode placements, JsonNode categories) {}
    public record CompleteRequest(List<GroupResponse> groups, int timeSpent) {}

    @GetMapping("/studies/{id}")
    @Transactional(readOnly = true)
    public StudyResponse get(@PathVariable String id, @RequestParam String token) {
        var study = studies.findByIdAndShareToken(id, token)
                .orElseThrow(() -> new SecurityException("Link de participação inválido."));
        ensurePublished(study);
        return mapper.toResponse(study, !study.isDashboardPrivate());
    }

    @GetMapping("/studies/by-code/{code}")
    @Transactional(readOnly = true)
    public StudyResponse byCode(@PathVariable String code) {
        var study = studies.findByAccessCodeIgnoreCase(code)
                .orElseThrow(() -> new SecurityException("Código de participação inválido."));
        ensurePublished(study);
        return mapper.toResponse(study, !study.isDashboardPrivate());
    }

    @PostMapping("/studies/{id}/sessions")
    @Transactional
    public ResponseEntity<StartResponse> start(@PathVariable String id, @RequestParam(required = false) String token,
                                               @jakarta.validation.Valid @RequestBody StartRequest request) {
        Study study = resolve(id, token, request.code());
        var session = new StudySession();
        session.setStudy(study);
        session.setParticipantName(request.participantName().trim());
        session.setParticipantEmail(request.participantEmail());
        sessions.save(session);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new StartResponse(session.getId(), mapper.toResponse(study, !study.isDashboardPrivate()),
                        json.createObjectNode(), session.getStartedAt()));
    }

    @GetMapping("/sessions/{sessionId}")
    @Transactional(readOnly = true)
    public StartResponse resume(@PathVariable String sessionId,
                                @RequestParam(required = false) String token,
                                @RequestParam(required = false) String code) {
        var session = inProgress(sessionId);
        boolean allowed = (token != null && token.equals(session.getStudy().getShareToken()))
                || (code != null && code.equalsIgnoreCase(session.getStudy().getAccessCode()));
        if (!allowed)
            throw new SecurityException("Sessão inválida para este link.");
        JsonNode draft;
        try {
            draft = json.readTree(session.getDraftJson());
        } catch (Exception ignored) {
            draft = json.createObjectNode();
        }
        return new StartResponse(session.getId(), mapper.toResponse(session.getStudy(), !session.getStudy().isDashboardPrivate()),
                draft, session.getStartedAt());
    }

    @PutMapping("/sessions/{sessionId}/draft")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void saveDraft(@PathVariable String sessionId, @RequestBody DraftRequest request) {
        var session = inProgress(sessionId);
        var draft = json.createObjectNode();
        draft.set("placements", request.placements());
        draft.set("categories", request.categories());
        session.setDraftJson(draft.toString());
        sessions.save(session);
    }

    @PostMapping("/sessions/{sessionId}/complete")
    @Transactional
    public SessionResponse complete(@PathVariable String sessionId, @RequestBody CompleteRequest request) {
        var session = inProgress(sessionId);
        try {
            session.setGroupsJson(json.writeValueAsString(request.groups()));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Não foi possível registrar os agrupamentos.");
        }
        session.setTimeSpent(Math.max(0, request.timeSpent()));
        session.setCompletedAt(Instant.now());
        session.setStatus(SessionStatus.COMPLETED);
        session.setDraftJson("{}");
        sessions.save(session);
        return mapper.session(session);
    }

    private Study resolve(String id, String token, String code) {
        var study = studies.findById(id).orElseThrow(() -> new SecurityException("Estudo não encontrado."));
        boolean allowed = (token != null && token.equals(study.getShareToken()))
                || (code != null && code.equalsIgnoreCase(study.getAccessCode()));
        if (!allowed) throw new SecurityException("Acesso inválido para este estudo.");
        ensurePublished(study);
        return study;
    }

    private StudySession inProgress(String id) {
        var session = sessions.findById(id).orElseThrow(() -> new SecurityException("Sessão inválida."));
        if (session.getStatus() != SessionStatus.IN_PROGRESS)
            throw new IllegalArgumentException("Esta sessão já foi concluída.");
        return session;
    }

    private void ensurePublished(Study study) {
        if (study.getStatus() != StudyStatus.PUBLISHED)
            throw new SecurityException("Este estudo não está disponível.");
    }
}
