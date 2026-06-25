package br.com.cardsortlab.repository;

import br.com.cardsortlab.domain.StudySession;
import br.com.cardsortlab.domain.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<StudySession, String> {
    List<StudySession> findByStudyIdOrderByStartedAtDesc(String studyId);
    List<StudySession> findByStudyIdAndStatusOrderByStartedAtDesc(String studyId, SessionStatus status);
    long countByStudyId(String studyId);
}
