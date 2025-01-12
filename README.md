# Kirana Store Management System

A backend service designed to help Kirana stores (local retail shops) manage their transaction registers effectively. The system handles daily credit and debit transactions with multi-currency support, generates financial reports, and provides secure access control.

## 🚀 Features

- Multi-currency transaction support with real-time currency conversion
- Weekly, monthly, or custom-date financial reporting
- Role-based access control (STORE_ADMIN, READ_WRITE, READ_ONLY)
- API rate limiting to prevent abuse
- Currency conversion rate caching
- Secure user authentication
- Distributed lock mechanism for concurrent operations

## 💻 Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB
- **Cache**: Redis
- **Language**: TypeScript
- **Authentication**: JWT

---

## 💡 Implementation Details

### Core Modules

```bash
src/
├── auth/ # Authentication & authorization module
├── use-cases/ # Application-specific business logic
│ ├── users/ # User management
│ ├── stores/ # Store management
│ ├── transactions/ # Transaction and report handling
├── common/ # Reusable components and utilities
│ ├── decorators/ # Custom decorators
│ ├── guards/ # Authorization, Role guards
│ ├── interceptors/ # Global or route-specific interceptors
│ ├── utils/ # Utility functions and helpers
├── core/ # Core services
│ ├── cache-service/ # Caching service
│ ├── distributed-lock-service/ # Distributed lock management
```

### Data Models

The system is built around three main entities:

- **Users**: Store administrators and staff members with role-based permissions
- **Stores**: Kirana stores with their administrative details
- **Transactions**: Financial transactions with multi-currency support

### Key Features Implementation

#### Multi-Currency Support

- Integration with [fxRates API](https://api.fxratesapi.com/latest) for real-time conversion rates
- Redis caching of conversion rates with configurable TTL
- Automatic conversion to INR for standardized reporting

#### Rate Limiting

- Redis-based rate limiting to prevent brute force

#### Distributed Lock Mechanism

The system implements a Redis-based distributed locking mechanism to handle concurrent operations safely.

- Prevents race conditions during simultaneous transactions
- Automatic lock expiration (TTL)
- Retry mechanism with configurable attempts
- Dead-lock prevention
- Graceful lock release on process termination

#### Financial Reporting

- Aggregation pipelines for efficient report generation
- Pre-calculated INR values for faster processing

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- Redis (v6+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kirana-store.git

# Install dependencies
cd kirana-store
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm run start:dev
```

### Environment Variables

```bash
Variable            | Description
------------------- | -------------------------
PORT                | Application port
MONGO_URI           | MongoDB connection URI
REDIS_URI           | Redis connection URI
JWT_SECRET          | JWT secret key
JWT_EXPIRATION      | JWT expiration time
FX_RATES_ENDPOINT   | Currency rates API endpoint
```

### 🛡️ Security Considerations

- All endpoints are protected with JWT authentication
- Password hashing using bcrypt
- Rate limiting to prevent brute force attacks
- Role-based access control for resource protection
- Input validation and sanitization through DTOs
- Distributed lock timeouts to prevent deadlocks

### ⚡ Performance Optimizations

- Currency conversion rate caching
- Database indexing on frequently queried fields
- Pagination for large data sets
- Efficient lock management with automatic cleanup
