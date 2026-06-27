package br.com.cardsortlab.config;

import br.com.cardsortlab.domain.*;
import br.com.cardsortlab.repository.SessionRepository;
import br.com.cardsortlab.repository.StudyRepository;
import br.com.cardsortlab.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.*;

@Configuration
public class DemoUserInitializer {
    private static final String DEMO_EMAIL = "demo@cardsort.local";
    private static final String DEMO_PASSWORD = "Demo1234";
    private static final String COLORS[] = {"#5a7cf8", "#22c88a", "#f59e0b", "#a78bfa", "#fb7185", "#38bdf8"};

    @Bean
    CommandLineRunner createDemoUser(UserRepository users,
                                     StudyRepository studies,
                                     SessionRepository sessions,
                                     PasswordEncoder passwords,
                                     ObjectMapper json,
                                     @Value("${app.demo-user.enabled:true}") boolean enabled) {
        return args -> {
            if (!enabled) return;

            var demo = users.findByEmailIgnoreCase(DEMO_EMAIL).orElseGet(() -> {
                var user = new UserAccount();
                user.setName("Pesquisador Demo");
                user.setEmail(DEMO_EMAIL);
                return user;
            });
            demo.setName("Pesquisador Demo");
            demo.setPasswordHash(passwords.encode(DEMO_PASSWORD));
            demo = users.save(demo);

            seedDemoStudies(demo, studies, sessions, json);
        };
    }

    private void seedDemoStudies(UserAccount demo, StudyRepository studies, SessionRepository sessions, ObjectMapper json) throws Exception {
        var existingNames = studies.findByOwnerIdOrderByUpdatedAtDesc(demo.getId()).stream()
                .map(Study::getName)
                .collect(java.util.stream.Collectors.toSet());

        if (!existingNames.contains("[Demo] E-commerce — Card Sorting Aberto")) {
            var study = study(demo,
                    "[Demo] E-commerce — Card Sorting Aberto",
                    "Exemplo de estudo aberto para descobrir como participantes organizam seções de uma loja virtual.",
                    "Agrupe os cartões da forma que fizer mais sentido para você. Crie e nomeie os grupos livremente.",
                    SortingType.OPEN,
                    List.of("Página inicial", "Carrinho", "Favoritos", "Pedidos", "Rastreamento", "Promoções", "Categorias", "Busca", "Ajuda", "Trocas e devoluções"),
                    List.of(),
                    "930101",
                    "demo-open-ecommerce-token");
            studies.save(study);
            saveSessions(study, sessions, json, openGroups(), 9);
        }

        if (!existingNames.contains("[Demo] App de Saúde — Card Sorting Fechado")) {
            var categories = List.of("Consultas", "Exames", "Medicamentos", "Plano e pagamentos");
            var study = study(demo,
                    "[Demo] App de Saúde — Card Sorting Fechado",
                    "Exemplo de estudo fechado para avaliar aderência de funcionalidades a categorias pré-definidas.",
                    "Arraste cada cartão para a categoria que você considera mais adequada.",
                    SortingType.CLOSED,
                    List.of("Agendar consulta", "Teleconsulta", "Resultados de exames", "Solicitar exame", "Renovar receita", "Lembrete de remédio", "Carteirinha do plano", "Pagar consulta", "Histórico médico", "Atestado médico"),
                    categories,
                    "930202",
                    "demo-closed-health-token");
            studies.save(study);
            saveSessions(study, sessions, json, closedGroups(study), 10);
        }

        if (!existingNames.contains("[Demo] Portal Acadêmico — Card Sorting Híbrido")) {
            var categories = List.of("Vida acadêmica", "Serviços", "Comunicação");
            var study = study(demo,
                    "[Demo] Portal Acadêmico — Card Sorting Híbrido",
                    "Exemplo de estudo híbrido para entender quando categorias fixas são suficientes e quando surgem grupos novos.",
                    "Use as categorias disponíveis. Se algum cartão não se encaixar, crie um novo grupo.",
                    SortingType.HYBRID,
                    List.of("Notas e frequência", "Matrícula", "Calendário acadêmico", "Biblioteca", "Financeiro", "Atendimento", "Notícias", "Eventos", "Iniciação científica", "Estágios"),
                    categories,
                    "930303",
                    "demo-hybrid-academic-token");
            studies.save(study);
            saveSessions(study, sessions, json, hybridGroups(study), 8);
        }
    }

    private Study study(UserAccount owner, String name, String description, String instructions, SortingType type,
                        List<String> cards, List<String> categories, String accessCode, String shareToken) {
        var study = new Study();
        study.setOwner(owner);
        study.setName(name);
        study.setDescription(description);
        study.setInstructions(instructions);
        study.setType(type);
        study.setStatus(StudyStatus.PUBLISHED);
        study.setAccessMode(AccessMode.LINK);
        study.setAccessCode(accessCode);
        study.setShareToken(shareToken);
        study.setDashboardPrivate(false);
        study.setTimerEnabled(true);
        study.setAllowUncertainCategory(type == SortingType.CLOSED);

        for (int i = 0; i < cards.size(); i++) {
            var card = new CardItem();
            card.setId("demo-card-" + slug(name) + "-" + (i + 1));
            card.setText(cards.get(i));
            card.setPosition(i);
            study.getCards().add(card);
        }

        for (int i = 0; i < categories.size(); i++) {
            var category = new CategoryItem();
            category.setId("demo-cat-" + slug(name) + "-" + (i + 1));
            category.setName(categories.get(i));
            category.setFixed(true);
            category.setColor(COLORS[i % COLORS.length]);
            category.setPosition(i);
            study.getCategories().add(category);
        }
        return study;
    }

    private void saveSessions(Study study, SessionRepository sessions, ObjectMapper json,
                              List<List<GroupSeed>> groupSets, int participantCount) throws Exception {
        for (int i = 0; i < participantCount; i++) {
            var session = new StudySession();
            session.setStudy(study);
            session.setParticipantName(DEMO_NAMES.get(i));
            session.setParticipantEmail("participante" + (i + 1) + "@exemplo.local");
            session.setConsentAccepted(true);
            session.setProfileJson(json.writeValueAsString(Map.of(
                    "area", DEMO_AREAS.get(i % DEMO_AREAS.size()),
                    "experience", DEMO_EXPERIENCE.get(i % DEMO_EXPERIENCE.size()),
                    "familiarity", DEMO_FAMILIARITY.get(i % DEMO_FAMILIARITY.size()),
                    "notes", "Perfil fictício para demonstração"
            )));
            session.setStatus(SessionStatus.COMPLETED);
            session.setTimeSpent(180 + (i * 23) % 210);
            session.setCompletedAt(Instant.now().minusSeconds((long) (participantCount - i) * 86_400));
            session.setGroupsJson(json.writeValueAsString(groupSets.get(i % groupSets.size()).stream()
                    .map(group -> Map.of(
                            "categoryId", group.categoryId(),
                            "categoryName", group.categoryName(),
                            "cardIds", group.cardIds().stream().map(cardIndex -> study.getCards().get(cardIndex).getId()).toList()
                    ))
                    .toList()));
            session.setDraftJson("{}");
            sessions.save(session);
        }
    }

    private List<List<GroupSeed>> openGroups() {
        return List.of(
                List.of(group("g1", "Compra", 1, 3, 4), group("g2", "Descoberta", 0, 5, 6, 7), group("g3", "Suporte", 8, 9), group("g4", "Conta", 2)),
                List.of(group("g1", "Navegação", 0, 6, 7), group("g2", "Pedidos", 1, 3, 4, 9), group("g3", "Promoções", 2, 5), group("g4", "Ajuda", 8)),
                List.of(group("g1", "Comprar", 1, 5, 6, 7), group("g2", "Minha área", 2, 3, 4), group("g3", "Atendimento", 8, 9), group("g4", "Início", 0)),
                List.of(group("g1", "Loja", 0, 5, 6, 7), group("g2", "Pós-compra", 3, 4, 9), group("g3", "Perfil", 1, 2), group("g4", "Ajuda", 8))
        );
    }

    private List<List<GroupSeed>> closedGroups(Study study) {
        var c = study.getCategories();
        return List.of(
                List.of(group(c.get(0), 0, 1, 9), group(c.get(1), 2, 3, 8), group(c.get(2), 4, 5), group(c.get(3), 6, 7)),
                List.of(group(c.get(0), 0, 1), group(c.get(1), 2, 3, 9), group(c.get(2), 4, 5, 8), group(c.get(3), 6, 7)),
                List.of(group(c.get(0), 0, 1, 8), group(c.get(1), 2, 3), group(c.get(2), 4, 5, 9), group(c.get(3), 6, 7)),
                List.of(group(c.get(0), 0, 1, 9), group(c.get(1), 2, 3), group(c.get(2), 4, 5), group(c.get(3), 6, 7, 8))
        );
    }

    private List<List<GroupSeed>> hybridGroups(Study study) {
        var c = study.getCategories();
        return List.of(
                List.of(group(c.get(0), 0, 1, 2, 8, 9), group(c.get(1), 3, 4, 5), group(c.get(2), 6, 7)),
                List.of(group(c.get(0), 0, 1, 2), group(c.get(1), 3, 4, 5), group(c.get(2), 6, 7), group("new-research", "Pesquisa e carreira", 8, 9)),
                List.of(group(c.get(0), 0, 1, 2, 9), group(c.get(1), 3, 4, 5), group(c.get(2), 6, 7), group("new-opportunities", "Oportunidades", 8)),
                List.of(group(c.get(0), 0, 1, 2), group(c.get(1), 3, 4, 5, 9), group(c.get(2), 6, 7), group("new-academic-life", "Projetos acadêmicos", 8))
        );
    }

    private GroupSeed group(String id, String name, Integer... cardIndexes) {
        return new GroupSeed(id, name, List.of(cardIndexes));
    }

    private GroupSeed group(CategoryItem category, Integer... cardIndexes) {
        return group(category.getId(), category.getName(), cardIndexes);
    }

    private String slug(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replace("[demo]", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    private record GroupSeed(String categoryId, String categoryName, List<Integer> cardIds) {}

    private static final List<String> DEMO_NAMES = List.of(
            "Ana Lima", "Bruno Carvalho", "Carla Santos", "Diego Mendes", "Elena Ferreira",
            "Fabio Alves", "Gisele Rodrigues", "Heitor Costa", "Inês Oliveira", "João Paulo"
    );

    private static final List<String> DEMO_AREAS = List.of(
            "Design", "Sistemas de Informação", "Administração", "Ciência da Computação", "Comunicação"
    );

    private static final List<String> DEMO_EXPERIENCE = List.of(
            "Iniciante", "Intermediário", "Avançado"
    );

    private static final List<String> DEMO_FAMILIARITY = List.of(
            "Baixa", "Média", "Alta"
    );
}
