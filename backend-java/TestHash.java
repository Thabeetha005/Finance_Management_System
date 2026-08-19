import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("V7 Hash matches password123: " + encoder.matches("password123", "$2a$10$93dk.v7w4VmpwShh8JtldeEpzKBWJ6UDZNcSOi7ScNBaY8BzaYwlS"));
        System.out.println("V9 Hash matches password123: " + encoder.matches("password123", "$2a$10$wI/zZ.1K84fVlJzP/Yy/l.j5aLgA4fB.P.N9G2.9bV/R.Q/F7Yx0W"));
    }
}
