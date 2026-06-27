package br.com.cardsortlab;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:cardsort-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class CardSortFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    @Test
    void completeResearcherAndParticipantFlow() throws Exception {
        var register = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Pesquisadora Teste","email":"teste@cardsort.local","password":"segura123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        var cookie = register.getResponse().getCookie("cardsort_session");

        var created = mvc.perform(post("/api/studies")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Arquitetura do portal",
                                  "description":"Validar a organização do conteúdo",
                                  "type":"OPEN",
                                  "instructions":"Agrupe todos os cards.",
                                  "cards":[{"text":"Início"},{"text":"Contato"},{"text":"Produtos"}],
                                  "categories":[],
                                  "accessMode":"LINK",
                                  "dashboardPrivate":true,
                                  "timerEnabled":true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode study = json.readTree(created.getResponse().getContentAsString());
        String studyId = study.get("id").asText();
        String token = study.get("shareToken").asText();

        var started = mvc.perform(post("/api/public/studies/" + studyId + "/sessions")
                        .param("token", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"participantName\":\"Participante Teste\",\"participantEmail\":\"p@teste.local\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String sessionId = json.readTree(started.getResponse().getContentAsString()).get("sessionId").asText();

        mvc.perform(put("/api/public/sessions/" + sessionId + "/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"placements\":{\"a\":\"g1\"},\"categories\":[{\"id\":\"g1\",\"name\":\"Grupo 1\",\"fixed\":false,\"color\":\"#5a7cf8\"}]}"))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/public/sessions/" + sessionId).param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.draft.placements.a").value("g1"));

        mvc.perform(post("/api/public/sessions/" + sessionId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"timeSpent":42,"groups":[{"categoryId":"g1","categoryName":"Grupo 1","cardIds":[]}]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("completed"));

        mvc.perform(get("/api/studies").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sessions[0].participantName").value("Participante Teste"));

        mvc.perform(get("/api/studies/" + studyId + "/exports/summary.csv").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("_resumo.csv")))
                .andExpect(content().string(containsString("Sessões concluídas")));

        mvc.perform(get("/api/studies/" + studyId + "/exports/sessions.csv").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Participante Teste")));

        mvc.perform(get("/api/studies/" + studyId + "/exports/sessions-anonymized.csv").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("P001")))
                .andExpect(content().string(not(containsString("Participante Teste"))))
                .andExpect(content().string(not(containsString("p@teste.local"))));

        mvc.perform(get("/api/studies/" + studyId + "/exports/similarity-matrix.csv").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Início")));
    }
}
