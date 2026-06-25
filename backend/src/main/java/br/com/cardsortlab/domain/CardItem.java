package br.com.cardsortlab.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class CardItem {
    @Id
    private String id = UUID.randomUUID().toString();
    @Column(nullable = false, length = 500)
    private String text;
    @Column(nullable = false)
    private int position;
    private String expectedCategoryId;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public String getExpectedCategoryId() { return expectedCategoryId; }
    public void setExpectedCategoryId(String expectedCategoryId) { this.expectedCategoryId = expectedCategoryId; }
}
