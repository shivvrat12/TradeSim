package com.tradesim.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Entity
@Table(name = "portfolio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private double balance;

    @ElementCollection(fetch = FetchType.EAGER)
    @MapKeyColumn(name = "symbol")
    @Column(name = "quantity")
    @CollectionTable(name = "portfolio_holdings", joinColumns = @JoinColumn(name = "portfolio_id"))
    private Map<String, Double> holdings;
}