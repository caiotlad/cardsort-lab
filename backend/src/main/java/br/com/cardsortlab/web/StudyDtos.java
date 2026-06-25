package br.com.cardsortlab.web;

import br.com.cardsortlab.domain.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public final class StudyDtos {
    private StudyDtos() {}

    public record CardRequest(String id, @NotBlank(message = "Todo card precisa ter um texto.") String text,
                              String expectedCategoryId) {}
    public record CategoryRequest(String id, @NotBlank(message = "Toda categoria precisa ter um nome.") String name,
                                  Boolean fixed, String color) {}
    public record StudyRequest(
            @NotBlank(message = "Informe o nome do estudo.") @Size(max = 180) String name,
            @NotBlank(message = "Informe a descrição ou objetivo.") String description,
            @NotNull(message = "Escolha o tipo do card sorting.") SortingType type,
            @NotBlank(message = "Informe as instruções ao participante.") String instructions,
            @NotEmpty(message = "Adicione pelo menos um card.") List<@Valid CardRequest> cards,
            List<@Valid CategoryRequest> categories,
            AccessMode accessMode,
            Boolean dashboardPrivate,
            Boolean allowUncertainCategory,
            Boolean timerEnabled) {}
    public record CardResponse(String id, String text, String expectedCategoryId) {}
    public record CategoryResponse(String id, String name, boolean fixed, String color) {}
    public record GroupResponse(String categoryId, String categoryName, List<String> cardIds) {}
    public record SessionResponse(String id, String participantId, String participantName, String participantEmail,
                                  Instant completedAt, int timeSpent, List<GroupResponse> groups, String status) {}
    public record StudyResponse(String id, String name, String description, String type, String instructions,
                                Instant createdAt, List<CardResponse> cards, List<CategoryResponse> categories,
                                List<SessionResponse> sessions, boolean isPrivate, String accessMode,
                                String accessCode, String shareToken, boolean allowUncertainCategory,
                                boolean timerEnabled, String status) {}
}
