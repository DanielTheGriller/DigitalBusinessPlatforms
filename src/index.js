import React from 'react';
import ReactDOM from 'react-dom';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis,
    CartesianGrid, Tooltip, ComposedChart, Legend, ReferenceLine, Label, Cell} from 'recharts';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";
import './index.css';
const data = require('./data/data');



class WeatherChartClass extends React.Component {
  render() {
    const weatherdata = this.props.weatherdata;
    const winddata = this.props.winddata;
    const city = this.props.city;
    return (
      <div className="dashboard">
        <h1 align='center'>{city}</h1>
        <ComposedChart
          width={620}
          height = {400}
          margin={{bottom: 30, top: 30, left: 10, right: 10}}
          data = {weatherdata}
          >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" dataKey="Temperature" unit="°C" scale="linear"
          domain={[-10,20]}/>
          <YAxis yAxisId="right" orientation="right" dataKey="Percipitation" unit="mm"
          domain={[0,12]} scale="linear"/>
          <Tooltip />
          <Legend />
          <Bar dataKey="Percipitation" barSize={30} fill="#0027FF" yAxisId="right" />
          <Line type="monotone" dataKey="Temperature" stroke="#ff7300" yAxisId="left"/>
          <ReferenceLine yAxisId="left" y={0} />
        </ComposedChart>
        <BarChart width={560} height={400} data={winddata} margin={{left: 10, right: 10}}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="date" />
          <YAxis unit="m/s"/>
          <Tooltip />
          <Legend />
          <Bar dataKey="Wind speed" barSize={30} fill="#109000" />
          <XAxis dataKey="direction" xAxisId="direction" axisLine={false} tickLine={false} orientation="top" mirror={true}>
            <Label value="" />
          </XAxis>
        </BarChart>
      </div>
    );
  }
}



function decideColor(flightEta) {
  if (flightEta>=5) return'#FF0000'
  else if(flightEta<=-5) return '#0000FF'
  else return '#00FF00'
}
const MyMapComponent = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={6}
    defaultCenter={{lat: 57, lng: 17}}
  >
    {data.flights.map((flight) =>
      <Polyline
        path={[{lat: flight.dep[0], lng: flight.dep[1]},
              {lat: flight.arr[0], lng: flight.arr[1]}]}
        options={{
          strokeColor: decideColor(flight.eta),
          strokeOpacity: 0.7,
          strokeWeight: 2,}}
        />
      )}
  </GoogleMap>
))



class FlightMapClass extends React.Component {
  render() {

    return(
      <div style={{width: '100%', height: '100%', margin: 0}}>
        <h1 align='center'>Ongoing flights</h1>
        <MyMapComponent
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC-JlESqo_UTUNA4PwtdekrQI46dNmvR40&callback=initMap"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `700px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          />
        <div className="mapLegend">
          <div className="colorblock" style={{background: '#00FF00'}} />
          <p className="mapLegend">On time</p>
          <div className="colorblock" style={{background: '#FF0000'}} />
          <p className="mapLegend">≥5 minutes late</p>
          <div className="colorblock" style={{background: '#0000FF'}} />
          <p className="mapLegend">≥5 minutes early</p>
        </div>
      </div>
    );
  }
}



class FlightChartOngoingClass extends React.Component {
  render(){
    const data = this.props.flightdata;
    const calculateEta = () => {
      let on_time = 0;
      let early = 0;
      let late = 0;
      data.forEach((cell) => {
        if(cell.eta>=5) {late+=1}
        else if (cell.eta<=-5) {early+=1}
        else if (-5<cell.eta<5){on_time+=1}
      });
      return [{name:'On time', val:on_time},{name:'Late', val:late},{name:'Early', val:early}]
    }

    const colors = ['#00FF00', '#FF0000', '#0000FF']

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const RADIAN = Math.PI / 180;
     	const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x  = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy  + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} 	dominantBaseline="central">
        	{`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return(
      <div>
        <h2 align='center'>Estimated arrival punctuality</h2>
        <h5 align='center'>(ongoing flights)</h5>
        <PieChart width={620} height={400} data={calculateEta()}>
          <Pie dataKey="val" isAnimationActive={true} data={calculateEta()} cx={320} cy={200} outerRadius={160} fill="#8884d8" label={renderCustomizedLabel} labelLine={false}>
            {
            	data.map((entry, index) => <Cell fill={colors[index % colors.length]}/>)
            }
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    );
  }
}



class FlightChartHistoryClass extends React.Component {
  render() {

    const data = this.props.flightdata;
    const calculateDelay = () => {
      let on_time = 0;
      let very_early = 0;
      let early = 0;
      let late = 0;
      let very_late = 0;
      data.forEach((cell) => {
        if (cell.delay>=30) {very_late+=1}
        if (15<=cell.delay&&cell.delay<30) {late+=1}
        if (-15<cell.delay&&cell.delay<15){on_time+=1}
        if (-30<cell.delay&&cell.delay<=-15) {early+=1}
        if (cell.delay<=-30) {very_early+=1}
      });

      return [
      {name: 'Very late (≥30min)', val:very_late},
      {name:'Late', val:late},
      {name:'On time (±15min)', val:on_time},
      {name:'Early', val:early},
      {name: 'Very early (≥30min)', val:very_early}
    ]
    }

    const colors = ['#800A0A','#FF0000','#00FF00', '#0000FF', '#00FFFF']

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
      const x  = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy  + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} 	dominantBaseline="central">
          {`${(percent * 100).toFixed(0.01)}%`}
        </text>
      );
    };

    return(
      <div>
      <h2 align='center'>{this.props.title}</h2>
      <h5 align='center'>{this.props.subtitle}</h5>
      <PieChart width={620} height={400} data={calculateDelay()}>
        <Pie dataKey="val" isAnimationActive={true} data={calculateDelay()} cx={320} cy={200} outerRadius={160} labelLine={false} label={renderCustomizedLabel}>
          {
            data.map((entry, index) => <Cell fill={colors[index % colors.length]}/>)
          }
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      </div>
    );
  }
}



class FlightEmergencyClass extends React.Component {
  render() {
    return(
      <div className="emergencyWindow">
        <h5>Ongoing emergencies:</h5>
        <ul className="emergency">{this.props.emergencydata.map((cell)=> {if(cell.text.length>2){return<li>{cell.text}</li>}else{return<li>No emergencies to show</li>}})}</ul>
      </div>
    );
  }
}



class ArrivalDepartureListClass extends React.Component {
  render(){
    const city = this.props.city;
    const flights = this.props.flightData;
    let list = [];
    if(flights){
      flights.map(f => list.push(`${f.number}\tETD: ${f.etd}\tETA: ${f.eta}\tDestination: ${f.destination}\tPassengers: ${f.passengers}\tEstimated delay: ${f.estimated_delay}\tReason: ${f.reason_of_delay}`))
    } else { list = [] }
    return(
      <div className="dashboard">
        <h1>{city}</h1>
          <ul className="arrdeplist">
            {list.map(a => <li className="arrdeplistitem">{a}</li>)}
          </ul>
      </div>
    );
  };
}



class FlightsDashboard extends React.Component {
  render() {
    return (
      <div className="dashboard">
        <div style={{margin: 0}}>
          <FlightEmergencyClass emergencydata={data.emergencies}/>
          <FlightMapClass />
        </div>
        <div className="dashboardrow">
          <FlightChartOngoingClass flightdata={data.flights}/>
          <FlightChartHistoryClass title="Arrival punctuality" subtitle="(past flights)" flightdata={data.arrivals}/>
          <FlightChartHistoryClass title="Departure punctuality" subtitle="(past flights)" flightdata={data.departures}/>
        </div>
      </div>
    );
  }
}

class ArrivalDepartureDashboard extends React.Component {
  render() {
    return (
      <div className="dashboard">
        <div className="dashboardrow">
          <ArrivalDepartureListClass flightData={data.helsinkiFlightsList} city='Helsinki' />
          <ArrivalDepartureListClass city="Stockholm"/>
          <ArrivalDepartureListClass city="Oslo"/>
        </div>
      </div>
    );
  }
}

class WeatherDashboard extends React.Component {
  render() {
    return (
      <div className="dashboardrow">
        <WeatherChartClass weatherdata={data.helsinkiWeather} winddata={data.helsinkiWind} city='Helsinki' />
        <WeatherChartClass weatherdata={data.stockholmWeather} winddata={data.stockholmWind} city='Stockholm' />
        <WeatherChartClass weatherdata={data.osloWeather} winddata={data.osloWind} city='Oslo' />
      </div>
    );
  }
}

class AirportDashboard extends React.Component {
  render() {
    return (
      <div className="dashboard">
        <div className="dashboardrow">
          <h1>Airport dashboard</h1>
        </div>
      </div>
    );
  }
}

class DashBoard extends React.Component {
  render() {
    return(
      <Router>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="/">Aviation Dashboard</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="/flights">Flights</Nav.Link>
            <Nav.Link href="/arrivals-and-departures">Arrivals and Departures</Nav.Link>
            <Nav.Link href="/weather">Weather</Nav.Link>
            <Nav.Link href="/airport">Airport</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="settings">Settings</Nav.Link>
          </Nav>
        </Navbar>
        <Switch>
          <Route path="/flights">
            <FlightsDashboard />
          </Route>
          <Route path="/arrivals-and-departures">
            <ArrivalDepartureDashboard />
          </Route>
          <Route path="/weather">
            <WeatherDashboard />
          </Route>
          <Route path="/airport">
            <AirportDashboard />
          </Route>
          <Route path="/">
            <div className="welcome">
              <h1>Welcome to Aviation Dashboard!</h1>
              <h1>Pick a dashboard from
              the top navigation bar to start!</h1>
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

// ========================================
ReactDOM.render(<DashBoard />, document.getElementById('root'));
