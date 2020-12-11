import React from 'react';
import ReactDOM from 'react-dom';
import { BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, Brush,
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



class CustomizedAxisTick extends React.PureComponent {
  render() {
    const {
      x, y, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
      </g>
    );
  }
}



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
    const header = this.props.header;
    const flights = this.props.flightData;
    let dataArray = [];
    const getData = () => {
      if (flights) {
      flights.forEach((f,i) => {
          dataArray.push(<tr key={i} className={`tablerow${i%2}`}><td>{f.number}</td><td>{f.etd}</td><td>{f.eta}</td><td>{f.destination}</td><td>{f.passengers}</td><td>{f.estimated_delay}</td><td>{f.reason_of_delay}</td></tr>)
            })
      } else {
        dataArray = ['no data']
        }
      }
    getData();

    return(
      <div className="dashboard" align="center" >
        <h1 className="tableHeader">{header}</h1>
        <div className="tableScrollable">
          <table className="arrdeplist">
            <tr align="center" >
              <th>Flight number</th>
              <th>Estimated Time of Departure</th>
              <th>Estimated Time of Arrival</th>
              <th>{this.props.origOrDest}</th>
              <th>Passengers</th>
              <th>Estimated delay</th>
              <th>Reason of delay</th>
            </tr>
            {dataArray.map(f => f)}
          </table>
        </div>
        <div className="passengerAmount">
          <h3>Passengers per flight</h3>
          <BarChart width={1800} height={500} data={flights}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="number" tick={<CustomizedAxisTick />}/>
            <YAxis type="number" domain={[0, 350]}/>
            <Tooltip />
            <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '20px' }} />
            <Bar dataKey="passengers" fill="#FFBD00" />
            <Brush dataKey="number" height={20} stroke="#FFBD00" y={430}/>
          </BarChart>
        </div>
      </div>
    );
  };
}



class AirportClass extends React.Component {
  render() {
    return(
      <div align="center">
        <h3>{this.props.header}</h3>
        <BarChart width={640} height={600} data={this.props.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill={this.props.color} />
        </BarChart>
      </div>
    );
  }
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
        <ArrivalDepartureListClass flightData={data.helsinkiDepartingFlightsList} origOrDest='Destination' header='Helsinki departing flights' />
        <ArrivalDepartureListClass flightData={data.helsinkiArrivingFlightsList} origOrDest='Origin' header='Helsinki arriving flights' />
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
      <div className="dashboard" align="center">
        <h1>Airport dashboard</h1>
        <div className="dashboardrow">
          <AirportClass data={data.airportPeople} header='People at the airport' color="#FFBD00"/>
          <AirportClass data={data.airportEmployees} header='Employees at the airport' color="#F366FF"/>
          <AirportClass data={data.airportPlanes} header='Airplanes at the airport' color="#2CFF95"/>
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
