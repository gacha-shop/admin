# Gacha Shop Location Service - Product Specification

**Platform**: Integrated map platform for gacha shops & figure shops nationwide
**Last Updated**: October 2025

---

## 1. Project Overview

### 1.1 Background & Market Need

The Japanese anime and gacha culture is rapidly growing in Korea, with gacha shops appearing nationwide. However, several critical problems exist:

- **Lack of centralized information**: Gacha shop location data is not systematically organized
- **Incomplete coverage**: Major map services (Naver, Kakao) only list large gacha shops, missing small/independent stores
- **Discovery challenges**: Consumers struggle to find shops with specific items they want
- **Limited promotion**: Shop owners lack effective channels to attract customers

### 1.2 Service Goals

Build a platform that integrates location information for all gacha shops and figure shops nationwide, creating an ecosystem that provides value to both consumers and shop owners.

---

## 2. Core Features

### 2.1 Map-Based Shop Location Service

**Primary Features:**
- National-scale map service using Google Maps or Naver Maps API
- Distinct markers for gacha shops vs. figure shops
- Current location-based nearby shop search
- Regional and category filtering
- Route guidance and distance display

**Shop Information:**
- Shop name, address, contact, business hours
- Approximate inventory (number of gacha machines, main series)
- Shop photos and atmosphere
- User reviews and ratings

### 2.2 Item Search Service

- Search for shops carrying specific gacha series or figures
- New stock arrival notifications
- Popular item rankings and trend information

### 2.3 Community Features

- User visit reviews and photo sharing
- Item exchange/trade bulletin board
- Favorites and wishlist functionality

---

## 3. Data Collection Strategy

The core of the service is accurate and comprehensive location data. A multi-layered data collection strategy:

### 3.1 Three-Phase Data Collection Roadmap

#### Phase 1: Initial Database (1-3 months)
- Direct research and online crawling focused on major cities (Seoul, Busan, Daegu, Incheon, Gwangju, Daejeon)
- Priority registration of large gacha shops and famous figure shops (minimum 50-100 shops)
- Collect and verify shops already registered on Naver Place and KakaoMap

#### Phase 2: Community-Based Expansion (3-6 months)
- Build user submission system with reward program
- Run submission campaigns on local communities (Karrot Market, Everytime)
- Provide points or discount coupons to verified submitters
- Expand database to small shops (target: 200-300 shops)

#### Phase 3: Shop Partnership Building (6-12 months)
- Build direct shop owner registration system (free business account)
- Provide detailed shop pages (business hours, inventory, event announcements)
- Simple management tools for shop owners
- Achieve nationwide coverage (target: 500+ shops)

### 3.2 Data Quality Management

- **Verification system**: Submitted information verified by admins or other users
- **Reliability score**: Display update date and reliability for each shop
- **Regular updates**: Reconfirm shop info every 3 months, archive closed shops
- **Deduplication**: Address-based automatic duplicate detection system

---

## 4. User Value Proposition

### 4.1 For General Users
- Convenient discovery of nearby gacha/figure shops at a glance
- Quick search for shops with desired items
- Reliable information through user reviews
- Stay informed with new shop and stock notifications

### 4.2 For Shop Owners
- Free platform to promote their shop
- Direct exposure to target customers (gacha enthusiasts)
- Increase customer traffic through inventory updates
- Channel for event and promotion announcements

---

## 5. Future Features (Advanced Roadmap)

Once user base is established, add these advanced features progressively:

### 5.1 Real-Time Inventory System
- Shop owner direct updates: Real-time updates of gacha series and figure inventory
- Japan official site integration: Detailed item info and images from Japanese gacha manufacturers
- Stock status display: Users can check availability of popular items

### 5.2 AI-Based Recommendation System
- Personalized shop recommendations based on user's interest series and visit history
- Suggest items liked by users with similar tastes

### 5.3 Reservation & Exchange System
- Pre-reservation for specific items (connect shops with users)
- Safe figure exchange and trade system within platform

### 5.4 Events & Collaborations
- Partnership events with gacha manufacturers or anime distributors
- Platform-exclusive promotions and discount coupons

---

## 6. Business Model

### 6.1 Initial Stage (Free Service)
- Focus on acquiring users and shop data
- Provide all features for free to maximize network effects

### 6.2 Monetization Strategy (After User Acquisition)
- **Premium shop listings**: Paid options for top placement, highlighting
- **Banner ads**: Advertising for related brands (anime goods, games)
- **Affiliate commissions**: Sales fees from online shop partnerships
- **Data analytics service**: Paid shop traffic stats and popular item trend reports

---

## 7. Recommended Tech Stack

### 7.1 Frontend
- **Web**: React or Next.js (web and mobile web)
- **Native App** (future): React Native or Flutter

### 7.2 Backend
- **Framework**: Node.js + Express OR Django/FastAPI (Python)
- **Database**: PostgreSQL + PostGIS (location data optimization)

### 7.3 Map API
- **Option 1**: Google Maps API (for global service readiness)
- **Option 2**: Naver/Kakao Maps API (optimized for Korea)

### 7.4 Infrastructure
- **Cloud**: AWS, GCP, or NCP (Naver Cloud Platform)
- **CI/CD**: GitHub Actions, Docker

---

## 8. Marketing & Growth Strategy

### 8.1 Initial User Acquisition
- Target marketing in gacha-related communities (Ruliweb, DCInside, TikTok, Instagram)
- Influencer collaborations (anime, gacha YouTubers/Instagrammers)
- Reward program for early users (points for reviews)

### 8.2 Viral Growth
- Friend referral events (benefits for both referrer and new user)
- Discount coupons for SNS sharing
- Shop visit verification events (photo upload lottery)

### 8.3 SEO & Content Marketing
- Blog content: Gacha culture, new series reviews, shop exploration
- Regional gacha shop guides (search engine optimization)

---

## 9. Key Success Factors

### First-Mover Advantage
Current major map services (Naver, Kakao) lack small gacha shop information - this is a significant opportunity.

### Network Effects
As more shops and users join, the platform becomes increasingly valuable to all participants.

### Community-Driven Growth
User submissions and reviews create a self-sustaining data collection system.

---

## 10. Development Priorities

### MVP (Minimum Viable Product)
1. Map-based shop location display
2. Basic shop information (name, address, hours)
3. User location and nearby search
4. Simple shop submission form

### Phase 2
1. User accounts and authentication
2. Reviews and ratings
3. Item search functionality
4. Admin verification system

### Phase 3
1. Shop owner accounts and management dashboard
2. Inventory update system
3. Notification system
4. Community features (exchange board, favorites)

---

## Conclusion

This service provides real value to both consumers and shop owners in the rapidly growing gacha market. Initial data collection challenges can be overcome through phased collection strategies and community participation. By securing first-mover advantage, we can expect strong network effects.

The current gap in small gacha shop information on existing map services (Naver, Kakao) presents a significant opportunity. Through systematic data collection and user-centric feature development, this can grow into a hub platform for gacha culture.
