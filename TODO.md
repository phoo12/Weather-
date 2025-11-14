# TODO: Implement Favorite System for Cities

## Tasks

- [x] Modify `backend/app/fetcher.py`:
  - [x] Add FAVORITES set to store favorite cities.
  - [x] Add `load_favorites()` function to read favorites from 'favorites.json' on startup.
  - [x] Add `save_favorites()` function to write favorites to 'favorites.json'.
  - [x] Modify startup logic to load favorites into CITIES set.
  - [x] Update `add_city_async` to only add non-favorite cities if they are valid, but allow adding favorites.
  - [x] Update `remove_city` to only remove non-favorite cities; favorites persist.
- [x] Modify `backend/app/main.py`:
  - [x] Add GET `/favorites` endpoint to return list of favorite cities.
  - [x] Add POST `/favorites` endpoint to add a city to favorites and persist.
  - [x] Add DELETE `/favorites/{city}` endpoint to remove a city from favorites and persist.
- [x] Modify `frontend/src/app/page.tsx`:
  - [x] Add `favorites` state to store list of favorite cities.
  - [x] Add `fetchFavorites()` function to fetch favorites on component load.
  - [x] Add star icon button to each city card for toggling favorite status.
  - [x] Implement `toggleFavorite()` function to handle favorite/unfavorite API calls.
  - [x] Update UI to visually distinguish favorite cities (e.g., different border or icon color).
- [x] Update `TODO.md` with completed tasks.

## Followup Steps

- [x] Test: Start server, add cities, mark some as favorites, restart server, verify favorites persist and non-favorites disappear.
- [x] Ensure SSE updates work correctly for favorites.
- [x] Verify frontend UI updates properly when toggling favorites.
