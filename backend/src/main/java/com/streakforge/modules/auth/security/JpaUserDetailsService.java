package com.streakforge.modules.auth.security;

import com.streakforge.modules.auth.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class JpaUserDetailsService implements UserDetailsService {
    private final UserAccountRepository userAccountRepository;

    public JpaUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userAccountRepository.findByEmailIgnoreCase(username)
                .map(user -> User.withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .disabled(!user.isEnabled())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User was not found"));
    }
}
