package com.tradesim.portfolio.repository;

import com.tradesim.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface  PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Optional<Portfolio> findByEmail(String email);
}
