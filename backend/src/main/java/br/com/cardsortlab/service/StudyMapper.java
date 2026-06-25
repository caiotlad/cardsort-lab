package br.com.cardsortlab.service;

import br.com.cardsortlab.domain.*;
import br.com.cardsortlab.repository.SessionRepository;
import br.com.cardsortlab.web.StudyDtos.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class StudyMapper {
    private final SessionRepository sessions;
    private final ObjectMapper json;

    public StudyMapper(SessionRepository sessions, ObjectMapper json) {
        this.sessions = sessions;
        this.json = json;
    }

    public StudyResponse toResponse(Study study, boolean includeSessions) {
        var cards = study.getCards().stream()
                .map(c -> new CardResponse(c.getId(), c.getText(), c.getExpectedCategoryId())).toList();
        var categories = study.getCategories().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.isFixed(), c.getColor())).toList();
        var sessionResponses = includeSessions
                ? sessions.findByStudyIdAndStatusOrderByStartedAtDesc(study.getId(), SessionStatus.COMPLETED)
                    .stream().map(this::session).toList()
                : List.<SessionResponse>of();
        return new StudyResponse(study.getId(), study.getName(), study.getDescription(),
                study.getType().name().toLowerCase(), study.getInstructions(), study.getCreatedAt(),
                cards, categories, sessionResponses, study.isDashboardPrivate(),
                study.getAccessMode().name().toLowerCase(), study.getAccessCode(), study.getShareToken(),
                study.isAllowUncertainCategory(), study.isTimerEnabled(), study.getStatus().name().toLowerCase());
    }

    public SessionResponse session(StudySession session) {
        List<GroupResponse> groups;
        try {
            groups = json.readValue(session.getGroupsJson(), new TypeReference<>() {});
        } catch (Exception ignored) {
            groups = List.of();
        }
        return new SessionResponse(session.getId(), session.getId(), session.getParticipantName(),
                session.getParticipantEmail(), session.getCompletedAt(),
                session.getTimeSpent() == null ? 0 : session.getTimeSpent(), groups,
                session.getStatus().name().toLowerCase());
    }
}
