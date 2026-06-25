package br.com.cardsortlab.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "categories")
public class CategoryItem {
    @Id
    private String id = UUID.randomUUID().toString();
    @Column(nullable = false, length = 160)
    private String name;
    @Column(nullable = false)
    private boolean fixed;
    @Column(nullable = false, length = 20)
    private String color = "#5a7cf8";
    @Column(nullable = false)
    private int position;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isFixed() { return fixed; }
    public void setFixed(boolean fixed) { this.fixed = fixed; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}
