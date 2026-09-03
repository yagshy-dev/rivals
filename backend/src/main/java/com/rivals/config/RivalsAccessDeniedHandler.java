package com.rivals.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rivals.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class RivalsAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RivalsAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(),
                ErrorResponse.of(403, "FORBIDDEN", "You do not have permission to perform this action"));
    }
}
