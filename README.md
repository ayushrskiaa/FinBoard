# FinBoard - Customizable Finance Dashboard

A powerful, real-time finance dashboard builder built with Next.js 15, Tailwind CSS, and Zustand. Connect to any financial API and visualize data using draggable widgets.

## Features

- **Custom Widgets**: Connect to any JSON API (Stocks, Crypto, Forex).
- **Flexible Visualizations**:
  - **Price Cards**: Display key metrics.
  - **Tables**: View list data (stocks, historical data).
  - **Charts**: Visualize trends with Area charts.
- **Drag and Drop**: Reorganize your dashboard layout easily.
- **Data Persistence**: Dashboard configuration is saved automatically to local storage.
- **Dynamic Field Selection**: Map any API response to widget fields using an intuitive selector.
- **Theme Support**: Toggle between Dark and Light premium themes.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4, Lucide React
- **State Management**: Zustand (with Persist middleware)
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Add a Widget**: Click "Add Widget" or "Load Demo Data".
2. **Connect API**: Enter a generic API URL (e.g., `https://api.coinbase.com/v2/prices/BTC-USD/spot`).
3. **Select Fields**: 
   - Test the connection.
   - Choose fields to display.
   - For **Tables/Charts**, ensure the API returns an array (e.g. `items[]`) and select fields inside it.
4. **Customize**: Set a title and refresh interval.
5. **Manage**: Drag widgets to reorder. Delete using the trash icon in Edit Mode.

## Example APIs to Try

- **Coinbase (Crypto Prices)**: `https://api.coinbase.com/v2/prices/BTC-USD/spot`
- **CoinGecko (Simple Price)**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
