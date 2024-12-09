import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import css from "./AddAddressForm.module.css";
import closeIcon from "../images/icons/close.png";
import TextUtil from "../TextUtil/TextUtil";

const AddAddressForm = ({ data, setAddressModal }) => {
  const initialValues = {
    addressLine: "",
    street: "",
    pincode: "",
    state: "",
    country: "",
  };
  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const { id } = useParams();

  const validationSchema = Yup.object({
    addressLine: Yup.string()
      .min(5, "Minimum 5 characters needed!")
      .required("Required"),
    street: Yup.string()
      .min(5, "Minimum 5 characters needed!")
      .required("Required"),
    pincode: Yup.string()
      .matches(/^\d{6}$/, "Pincode must be 6 digits")
      .required("Required"),
    state: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
  });
  const navigate = useNavigate();
  const submitForm = async (values) => {
    if (data) {
      addRestaurant(values);
    } else {
      addAddress(values);
    }
  };

  const addAddress = async (values) => {
    const payload = {
      address: {
        addressLine: values.addressLine,
        street: values.street,
        pincode: values.pincode,
        state: values.state,
        country: values.country,
      },
    };

    try {
      console.log(id, loginUser.token);
      const response = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        payload,
        {
          headers: {
            authorization: `Bearer ${loginUser.token}`,
          },
        }
      );
      alert(`Address updated successfully!!`);
      //   setPage(1);
      setAddressModal(false);
      // navigate("/");
    } catch (error) {
      console.log(error);
      console.error(
        "Error updating address:",
        error.response?.data || error.message
      );
      alert(
        `Failed to update address: ${
          error.response?.data.message || "Unknown error"
        }`
      );
    }
  };

  const addRestaurant = async (values) => {
    const payload = {
      name: data.fullName,
      location: {
        addressLine: values.addressLine,
        street: values.street,
        pincode: values.pincode,
        state: values.state,
        country: values.country,
      },
      contact: data.phone,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/restaurants",
        payload
      );
      console.log("Success:", response.data);
      alert(`Restaurant created successfully!!`);
      //   setPage(1);
      setAddressModal(false);
      navigate("/"); // Go back or close modal after success
    } catch (error) {
      console.error(
        "Error creating restaurant:",
        error.response?.data || error.message
      );
      alert(
        `Failed to create restaurant: ${
          error.response?.data.message || "Unknown error"
        }`
      );
    }
  };

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.header}>
          <div className={css.ttl}>Add Address</div>
          <div className={css.imgBox} onClick={() => setAddressModal(false)}>
            <img className={css.closeIcon} src={closeIcon} alt="Close" />
          </div>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={submitForm}
        >
          {(formik) => (
            <Form className={css.form}>
              <TextUtil name="addressLine" placeholder="Address Line*" />
              <TextUtil name="street" placeholder="Street*" />
              <TextUtil name="pincode" placeholder="Pincode*" />
              <TextUtil name="state" placeholder="State*" />
              <TextUtil name="country" placeholder="Country*" />
              <ErrorMessage name="addressLine">
                {(msg) => <div className={css.errorMessage}>{msg}</div>}
              </ErrorMessage>
              <div className={css.ftr}>
                <button type="submit" className={css.btn}>
                  Save And Proceed
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddAddressForm;
