# Chillar Club Database Schema

This document outlines the database schema for the Chillar Club application.

## Entity Relationship Diagram

```
+---------------+       +------------------+       +---------------+
|     users     |       |   subscriptions  |       |    rewards    |
+---------------+       +------------------+       +---------------+
| id            |       | id               |       | id            |
| email         |       | user_id          |<----->| title         |
| password_hash |       | status           |       | description   |
| uid           |<------| razorpay_sub_id  |       | value         |
| display_name  |       | start_date       |       | image_url     |
| is_admin      |       | end_date         |       | week          |
| profile_data  |       | plan_type        |       | draw_date     |
| referral_code |       | amount           |       | is_featured   |
| referred_by   |       | payment_id       |       | created_at    |
| created_at    |       | metadata         |       | updated_at    |
| updated_at    |       | created_at       |       +------+--------+
+---------+-----+       | updated_at       |              |
          |             +------------------+              |
          |                                               |
          |             +------------------+              |
          |             |      draws       |              |
          |             +------------------+              |
          |             | id               |              |
          +------------>| user_id          |<-------------+
                        | reward_id        |
                        | week             |
                        | draw_date        |
                        | winning_number   |
                        | is_claimed       |
                        | created_at       |
                        | updated_at       |
                        +------------------+
                                |
                                |
                        +-------v--------+
                        |     claims     |
                        +----------------+
                        | id             |
                        | user_id        |
                        | reward_id      |
                        | status         |
                        | claim_details  |
                        | created_at     |
                        | updated_at     |
                        +----------------+
```

## Tables

### users
- `id`: Primary key
- `email`: User's email address (unique)
- `password_hash`: Hashed password (if using password auth)
- `uid`: Firebase Auth UID (unique)
- `display_name`: User's display name
- `is_admin`: Boolean indicating admin privileges
- `profile_data`: JSON object containing profile information
- `referral_code`: Unique referral code
- `referred_by`: Referral code used during signup
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### subscriptions
- `id`: Primary key
- `user_id`: Foreign key to users.id
- `status`: Subscription status (active, cancelled, expired, etc.)
- `razorpay_sub_id`: Razorpay subscription ID
- `start_date`: Date when subscription started
- `end_date`: Date when subscription ends
- `plan_type`: Subscription plan type (monthly, annual)
- `amount`: Subscription amount
- `payment_id`: Payment reference ID
- `metadata`: Additional subscription details as JSON
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### rewards
- `id`: Primary key
- `title`: Reward title
- `description`: Reward description
- `value`: Monetary value of reward
- `image_url`: URL to reward image
- `week`: Week identifier (YYYY-WW format)
- `draw_date`: Scheduled date for the draw
- `is_featured`: Boolean indicating a featured reward
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### draws
- `id`: Primary key
- `user_id`: Foreign key to users.id (winner)
- `reward_id`: Foreign key to rewards.id
- `week`: Week identifier (YYYY-WW format)
- `draw_date`: Date when draw occurred
- `winning_number`: The winning number/sequence
- `is_claimed`: Boolean indicating if reward is claimed
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### claims
- `id`: Primary key
- `user_id`: Foreign key to users.id
- `reward_id`: Foreign key to rewards.id
- `status`: Claim status (pending, approved, rejected)
- `claim_details`: JSON data with claiming details
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update