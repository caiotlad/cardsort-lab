package br.com.cardsortlab.repository;

import br.com.cardsortlab.domain.Study;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface StudyRepository extends JpaRepository<Study, String> {
    List<Study> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);
    Optional<Study> findByIdAndOwnerId(String id, String ownerId);
    Optional<Study> findByIdAndShareToken(String id, String shareToken);
    Optional<Study> findByAccessCodeIgnoreCase(String accessCode);
}
