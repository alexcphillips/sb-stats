import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar/Navbar';
// import PlayerPage from './pages/PlayerPage';

function App() {
	return (
		<BrowserRouter>
			{/* <Navbar /> */}

			<Routes>
				<Route path="/" element={'temp homepage'} />
				{/* <Route path="/player/:playerName" element={<PlayerPage />} /> */}

				<Route path="*" element={'No match!'} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
