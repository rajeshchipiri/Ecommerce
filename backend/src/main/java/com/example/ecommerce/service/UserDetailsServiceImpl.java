package com.example.ecommerce.service;

import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    private UserRepository userRepository;


    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail)
            throws UsernameNotFoundException {
        logger.error("DEBUG: Loading user by usernameOrEmail: " + usernameOrEmail);
        return userRepository.findByUsername(usernameOrEmail)
                .map(user -> {
                    logger.error("DEBUG: Found user in DB: " + user.getUsername());
                    return user;
                })
                .orElseGet(() -> {
                    logger.error("DEBUG: User not found by username, searching by email...");
                    return userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> {
                            logger.error("DEBUG: User NOT found in DB at all: " + usernameOrEmail);
                            return new UsernameNotFoundException("User not found with username or email : " + usernameOrEmail);
                        });
                });
    }


    @Transactional
    public UserDetails loadUserById(Long id) {
        return userRepository.findById(id).orElseThrow(
            () -> new UsernameNotFoundException("User not found with id : " + id)
        );
    }
}
