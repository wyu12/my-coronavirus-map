import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';
import axios from 'axios';

const LOCATION = {
  lat: 38.9072,
  lng: -77.0369
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
        let response; //stores what API returns

        try{
          response = await axios.get('https://corona.lmao.ninja/v2/countries');
        } catch(e){
          console.log(`Failed to fetch countries: ${e.message}`, e);
          return;
        }

        const { data = [] } = response; //data is an array that stores all the data fetched
        if(!(Array.isArray(data) && data.length > 0)) return;

        const geoJson = {
          type: 'FeatureCollection',
          features: data.map((country = {}) => {  //"country" object represents an element from the original array

            const { countryInfo = {} } = country; //extract countryInfo array from the "country" object
            const { lat, long: lng } = countryInfo; //extract lat and lng info from countryInfo array

            return{
              type: 'Feature', 
              properties: {
                ...country, //JS spread syntax: this array (iterable) will fill in all the elements
              },
              geometry: {
                type: 'Point',
                coordinates: [ lng, lat ]
              }
            }

          })
        };

        const geoJsonLayers = new L.GeoJSON(geoJson, {  //note: this second parameter represents an "Options" object
          pointToLayer: (feature = {}, latlng ) => {  //we are defining a custom pointToLayer function
            const { properties = {} } = feature;
            let updatedFormatted;
            let casesString;

            const {
              country,
              updated,
              cases,
              deaths,
              recovered
            } = properties;   //destructuring data from properties list

            casesString = `${cases}`;

            if(cases > 1000){ //use "K" instead of the raw number (thousands)
              casesString = `${casesString.slice(0,-3)}k+`
            }
            if (updated) {
              updatedFormatted = new Date(updated).toLocaleString(); //format the date from the raw number to a date string
            }
            const html = `
              <span class="icon-marker">
                <span class="icon-marker-tooltip">
                  <h2>${country}</h2>
                  <ul>
                    <li><strong>Confirmed:</strong> ${casesString} </li>
                    <li><strong>Deaths: </strong>${deaths}</li>
                    <li><strong>Recovered: </strong>${recovered}</li>
                    <li><strong>Last Updated: </strong>${updatedFormatted}</li>
                  </ul>
                </span>
              </span>
            `;

            return L.marker( latlng, {

              icon: L.divIcon({
                className: 'icon',
                html
                }),
                riseOnHover: true
            });
          }

        });//end geoJSON line

        geoJsonLayers.addTo(map);

  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <pre>
          <code>gatsby new [directory] https://github.com/colbyfayock/gatsby-starter-leaflet</code>
        </pre>
        <p className="note">Note: Gatsby CLI required globally for the above command</p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
