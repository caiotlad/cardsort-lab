package br.com.cardsortlab.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "studies")
public class Study {
    @Id
    private String id = UUID.randomUUID().toString();
    @Column(nullable = false, length = 180)
    private String name;
    @Column(nullable = false, length = 2000)
    private String description;
    @Column(nullable = false, length = 4000)
    private String instructions;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SortingType type;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudyStatus status = StudyStatus.PUBLISHED;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessMode accessMode = AccessMode.LINK;
    @Column(nullable = false, unique = true, length = 20)
    private String accessCode;
    @Column(nullable = false, unique = true, length = 80)
    private String shareToken;
    @Column(nullable = false)
    private boolean dashboardPrivate = true;
    @Column(nullable = false)
    private boolean allowUncertainCategory;
    @Column(nullable = false)
    private boolean timerEnabled = true;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserAccount owner;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "study_id")
    @OrderBy("position ASC")
    private List<CardItem> cards = new ArrayList<>();
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "study_id")
    @OrderBy("position ASC")
    private List<CategoryItem> categories = new ArrayList<>();

    @PreUpdate
    void updateTimestamp() { updatedAt = Instant.now(); }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public SortingType getType() { return type; }
    public void setType(SortingType type) { this.type = type; }
    public StudyStatus getStatus() { return status; }
    public void setStatus(StudyStatus status) { this.status = status; }
    public AccessMode getAccessMode() { return accessMode; }
    public void setAccessMode(AccessMode accessMode) { this.accessMode = accessMode; }
    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }
    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }
    public boolean isDashboardPrivate() { return dashboardPrivate; }
    public void setDashboardPrivate(boolean dashboardPrivate) { this.dashboardPrivate = dashboardPrivate; }
    public boolean isAllowUncertainCategory() { return allowUncertainCategory; }
    public void setAllowUncertainCategory(boolean allowUncertainCategory) { this.allowUncertainCategory = allowUncertainCategory; }
    public boolean isTimerEnabled() { return timerEnabled; }
    public void setTimerEnabled(boolean timerEnabled) { this.timerEnabled = timerEnabled; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public UserAccount getOwner() { return owner; }
    public void setOwner(UserAccount owner) { this.owner = owner; }
    public List<CardItem> getCards() { return cards; }
    public List<CategoryItem> getCategories() { return categories; }
}
