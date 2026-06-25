package br.com.cardsortlab.web;

import br.com.cardsortlab.domain.*;
import br.com.cardsortlab.repository.UserRepository;
import br.com.cardsortlab.security.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final boolean secureCookie;

    public AuthController(UserRepository users, PasswordEncoder passwords, JwtService jwt,
                          @Value("${app.cookie.secure}") boolean secureCookie) {
        this.users = users;
        this.passwords = passwords;
        this.jwt = jwt;
        this.secureCookie = secureCookie;
    }

    public record LoginRequest(@Email(message = "Informe um e-mail válido.") String email,
                               @NotBlank(message = "Informe sua senha.") String password) {}
    public record RegisterRequest(@NotBlank(message = "Informe seu nome.") @Size(max = 120) String name,
                                  @Email(message = "Informe um e-mail válido.") String email,
                                  @Size(min = 8, message = "A senha deve ter ao menos 8 caracteres.") String password) {}
    public record UserResponse(String id, String name, String email, String role) {}

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) throw new IllegalArgumentException("Este e-mail já está cadastrado.");
        var user = new UserAccount();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwords.encode(request.password()));
        users.save(user);
        setCookie(response, jwt.create(user));
        return toResponse(user);
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        var user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha incorretos."));
        if (!passwords.matches(request.password(), user.getPasswordHash()))
            throw new IllegalArgumentException("E-mail ou senha incorretos.");
        setCookie(response, jwt.create(user));
        return toResponse(user);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        var user = users.findById(authentication.getName()).orElseThrow();
        return toResponse(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, "")
                .httpOnly(true).secure(secureCookie).sameSite("Lax").path("/").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    private void setCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(JwtAuthenticationFilter.COOKIE_NAME, token)
                .httpOnly(true).secure(secureCookie).sameSite("Lax").path("/")
                .maxAge(Duration.ofHours(24)).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private UserResponse toResponse(UserAccount user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), "admin");
    }
}
