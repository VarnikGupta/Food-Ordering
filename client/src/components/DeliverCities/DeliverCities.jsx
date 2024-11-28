import PlacesCard from "../PlacesCard/PlacesCard";
import "./DeliverCities.css";

let DeliveryCities = () => {
  return (
    <div className='outerDiv'>
      <div className='title'>
        <span className='titleTxt'>Cities where we Deliver</span>{" "}
        {/* <span className='bld'>Hyderabad</span> */}
      </div>
      <div className='placesCards'>
        <PlacesCard place="Delhi" />
        <PlacesCard place="Mumbai" />
        <PlacesCard place="Haryana" />
        <PlacesCard place="Uttar Pradesh" />
        <PlacesCard place="Kolkata" />
        <PlacesCard place="Pune" />
        <PlacesCard place="Chennai" />
        <PlacesCard place="Jaipur" />
        <PlacesCard place="Banglore" />
        <PlacesCard place="Gurgaon" />
        <PlacesCard place="Hyderabad" />
        <PlacesCard place="Noida" />
      </div>
    </div>
  );
};

export default DeliveryCities;