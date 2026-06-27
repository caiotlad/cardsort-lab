package br.com.cardsortlab.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "study_sessions")
public class StudySession {
    @Id
    private String id = UUID.randomUUID().toString();
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Study study;
    @Column(nullable = false, length = 120)
    private String participantName;
    @Column(length = 180)
    private String participantEmail;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.IN_PROGRESS;
    @Lob
    private String draftJson = "{}";
    @Lob
    private String groupsJson = "[]";
    private Boolean consentAccepted = false;
    @Lob
    private String profileJson = "{}";
    @Column(nullable = false)
    private Instant startedAt = Instant.now();
    private Instant completedAt;
    private Integer timeSpent;

    public String getId() { return id; }
    public Study getStudy() { return study; }
    public void setStudy(Study study) { this.study = study; }
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }
    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
    public String getDraftJson() { return draftJson; }
    public void setDraftJson(String draftJson) { this.draftJson = draftJson; }
    public String getGroupsJson() { return groupsJson; }
    public void setGroupsJson(String groupsJson) { this.groupsJson = groupsJson; }
    public boolean isConsentAccepted() { return Boolean.TRUE.equals(consentAccepted); }
    public void setConsentAccepted(boolean consentAccepted) { this.consentAccepted = consentAccepted; }
    public String getProfileJson() { return profileJson; }
    public void setProfileJson(String profileJson) { this.profileJson = profileJson; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Integer getTimeSpent() { return timeSpent; }
    public void setTimeSpent(Integer timeSpent) { this.timeSpent = timeSpent; }
}
