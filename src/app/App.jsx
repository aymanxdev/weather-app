import React, {
	useEffect,
	useState,
} from 'react'
import http from '../http'
import { sleep } from '../helpers'

//Styles
import './App.css';

const getDay = date => {
const day = new Date(date).getDay()
  return {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday',
  }[day]
}
const getIconUrl = name => {
  return `http://openweathermap.org/img/wn/${name}.png`
}


function App() {
  
  const [time, setTime] = useState(0)
  const [error, setError] = useState(false)
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [localTime] = useState(
    new Date().toLocaleString('en-UK', {
      timeZone: 'Europe/London'
    }).split(',').pop()
  )

  const showError = async () => {
    if (error) return 
    setError(true)
    await sleep(3, 'SEC')
    setError(false)
  }

  const fetchData = async () => {
    console.log('Fetching weather data...')
    //Get current weather data
    let weatherRes = await http.getWeather()
    if (!weatherRes.error){
      setWeather(weatherRes.data)
      console.log('Weather', weatherRes.data);
      localStorage.setItem('OPEN_WEATHER', JSON.stringify(weatherRes.data))
    } else showError()
  
  //Get 5 days forecast data
  let forecastRes = await http.getForecast()
  if(!forecastRes.error) {
    setForecast(forecastRes.data)
    console.log('Forecast', forecastRes.data);
    localStorage.setItem('OPEN_FORECAST', forecastRes.data, )
  } else showError()

  console.log('Fetching complete!');
  }

  const refreshData = async () => {
    //Fetching data
    await fetchData()

    //Initialising time
    let lTime = 0
    setTime(lTime)

    //Interval runs every second 
    const minInterval = setInterval(() => {
			if (lTime === 59) {
				// Clear the interval and refresh data
				clearInterval(minInterval)
				refreshData()
			} else {
				// increasing current second
				lTime += 1
				setTime(lTime)
			}
		}, 1000);
  }

  //Effects

  useEffect(() => {
    let localWeather = localStorage.getItem('OPEN_WEATHER')
    localWeather && setWeather(JSON.parse(localWeather))

    let localForecast = localStorage.getItem('OPEN_FORECAST')
    localForecast && setForecast(JSON.parse(localForecast))

    refreshData()

  }, [ ])

  const uniqueForecast = (() =>{
    return forecast
            ? forecast.list.filter(
              a => a.dt_tx.includes('00: 00: 00')
            )
            : []
  }) ()

  return (
    <div className="App">
			<header className="app__header">
				<div className="container">
					{(weather && weather.weather) && <div className='header'>
						<div className="header__time">
							{localTime}
						</div>
						<h2 className="header__title">
							{weather.name}
						</h2>
						<div className="header__condition">
							<span>{weather.weather[0].main}</span>
							<img src={getIconUrl(weather.weather[0].icon)} alt="Weather Icon" />
						</div>
						<div className="header__temp">
							{weather.main.temp.toFixed(0)}
							<sup>°C</sup>
						</div>
					</div>}
					<div className="header__slider">
						<div className='header__progress'>
							<div style={{
								width: `${(time / 59) * 100}%`
							}}>
							</div>
							<span className='header__countdown'>
								Reloading in {60 - time}s
							</span>
						</div>
					</div>
				</div>
			</header>
			{forecast && <div className="forecast">
				{uniqueForecast.map((w, wi) => (
					<div className='forecast__box' key={wi}>
						<div className="forecast__day">
							{getDay(w.dt_txt)}
						</div>
						<div className='flex center'>
							<div className="forecast__temp">
								{w.main.temp.toFixed(0)}<sup>°C</sup>
							</div>
							<div className="forecast__icon">
								<img src={getIconUrl(w.weather[0].icon)} alt="Weather Icon" />
								<span>{w.weather[0].main}</span>
							</div>
						</div>
					</div>
				))}
			</div>}
			<div className={`app__error${error ? ' show' : ''}`}>
				Error fetching data
			</div>
		</div>
  );
}

export default App;
