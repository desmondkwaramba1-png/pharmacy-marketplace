# MediFind Zimbabwe – Pharmacy Locator System

A full-stack, mobile-friendly web application designed to help patients in Zimbabwe find available pharmaceutical products across multiple pharmacies. The system is optimized for low-bandwidth environments (3G networks) and features distance-based ranking, real-time stock visibility, and a comprehensive backend for pharmacists to manage their inventory.

## Project Structure

This monorepo contains two primary directories:

- `/backend`: Node.js + Express API powered by Prisma ORM and PostgreSQL.
- `/mobile`: React Native (Expo) application. The primary mobile interface for both patients and pharmacists.

## Features

### Patient Facing (Mobile)
- **Fuzzy Medicine Search**: Search by name or category.
- **Native Geolocation**: Ranks pharmacies by distance from your current location.
- **Interactive Maps**: Pinpoints pharmacies with one-touch directions.
- **Low-Bandwidth Optimized**: Efficient data fetching with React Query.

### Pharmacist Admin (Mobile)
- **Inventory Dashboard**: Quick stats on stock levels.
- **In-App Management**: Update stock status (In Stock / Low / Out) instantly.
- **Regional Trends**: See what patients are searching for nearby.

## Setup Instructions

### 1. Database
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Mobile App
```bash
cd mobile
npm install
npx expo start
```
*Scan the QR code with the Expo Go app on your phone.*


## Running the Application

You can run both the frontend and backend simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*The API server will run on `http://localhost:3000`.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*The Vite development server will run on `http://localhost:5173` and automatically proxy `/api` requests to the backend.*

## Testing with Demo Accounts

If you ran the seed script, you can log into the Admin portal using any of the generated demo accounts. For example:

- **Email**: `admin@pharmacy1.com`
- **Password**: `Password123`

*(Other accounts include `admin@pharmacy2.com`, up to `admin@pharmacy5.com`, all with the same password).*

---

*Designed and implemented with modern standard practices for resilient healthcare technical infrastructure.*
