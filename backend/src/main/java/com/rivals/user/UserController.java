package com.rivals.user;

import com.rivals.user.dto.UserSummaryResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Employee directory search (contracts/users.md) — covers User Story 4. */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserSummaryResponse> search(
            @RequestParam String search,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        return userService.search(search, limit, offset);
    }
}
