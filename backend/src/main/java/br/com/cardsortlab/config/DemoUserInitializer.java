package br.com.cardsortlab.config;

import br.com.cardsortlab.domain.UserAccount;
import br.com.cardsortlab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DemoUserInitializer {
    @Bean
    CommandLineRunner createDemoUser(UserRepository users,
                                     PasswordEncoder passwords,
                                     @Value("${app.demo-user.enabled:true}") boolean enabled) {
        return args -> {
            if (!enabled || users.existsByEmailIgnoreCase("demo@cardsort.local")) return;
            var demo = new UserAccount();
            demo.setName("Pesquisador Demo");
            demo.setEmail("demo@cardsort.local");
            demo.setPasswordHash(passwords.encode("Demo1234"));
            users.save(demo);
        };
    }
}
