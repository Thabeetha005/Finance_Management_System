package com.kalpanaafinance.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Integer extractTokenVersion(String token) {
        try {
            final Claims claims = extractAllClaims(token);
            Object tv = claims.get("tokenVersion");
            if (tv instanceof Number) {
                return ((Number) tv).intValue();
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof com.kalpanaafinance.entity.User u) {
            if (u.getTokenVersion() != null) {
                claims.put("tokenVersion", u.getTokenVersion());
            }
        }
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        if (userDetails instanceof com.kalpanaafinance.entity.User u && u.getTokenVersion() != null) {
            extraClaims.putIfAbsent("tokenVersion", u.getTokenVersion());
        }
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean usernameMatches = username.equals(userDetails.getUsername());
        if (!usernameMatches || isTokenExpired(token)) {
            return false;
        }
        if (userDetails instanceof com.kalpanaafinance.entity.User u) {
            Integer tokenVersionInJwt = extractTokenVersion(token);
            if (tokenVersionInJwt != null && u.getTokenVersion() != null) {
                if (!tokenVersionInJwt.equals(u.getTokenVersion())) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
