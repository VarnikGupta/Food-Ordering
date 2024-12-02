import { useState } from "react";
import { createPortal } from "react-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";

import css from "./EditProfileModal.module.css";

import closeBtn from "../../images/closeBtn.jpg";
import RedBtnHov from "../../RedBtnHov/RedBtnHov";
import WhiteBtnHov from "../../WhiteBtnHov/WhiteBtnHov";
import TextUtil from "../../TextUtil/TextUtil";
import { useParams } from "react-router-dom";

const EditProfileModal = ({ setModal }) => {
  const [initialValues, setInitialValues] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const validationSchema = Yup.object({
    fullName: Yup.string().min(3, "Minimum 3 characters required!"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Enter a valid phone number!")
      .nullable(),
    address: Yup.string().min(5, "Minimum 5 characters required!"),
  });

  const { id } = useParams();
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const submitForm = async (values, { setSubmitting }) => {
    console.log(initialValues);
    try {
      setSubmitting(true);

      // Remove empty fields
      const updateFields = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value.trim() !== "")
      );

      if (Object.keys(updateFields).length === 0) {
        alert("No fields to update!");
        setSubmitting(false);
        return;
      }

      // API Call using Axios
      const response = await axios.put(`/api/users/${id}`, updateFields, {
        headers: {
          Authorization: `Bearer ${loginUser.token}`,
          "Content-Type": "application/json",
        },
      });

      alert(`Success: ${response.data.message}`);
      setModal(false); // Close modal on success
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      alert(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomUpdate = (values) => {
    // console.log("Custom Update Triggered with values:", values);

    // Validate values manually if needed
    if (!values.fullName && !values.phone && !values.address) {
      alert("Please provide at least one field to update.");
      return;
    }
    if (!/^\d{10}$/.test(values.phone)) {
      alert("Please provide valid phone number");
      return;
    }

    const payload = {
      ...(values.fullName && { name: values.fullName }),
      ...(values.phone && { phone: values.phone }),
      ...(values.address && { address: values.address }),
    };
    // console.log(payload)

    axios
      .put(`http://localhost:5000/api/users/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${loginUser.token}`,
        },
      })
      .then((response) => {
        console.log("Update Successful:", response.data);
        if (payload.name) {
          loginUser.name = payload.name;
          localStorage.setItem("auth", JSON.stringify(loginUser));
          window.location.reload();
        }
        setModal(false); // Close the modal after success
      })
      .catch((error) => {
        console.error("Update Failed:", error.response?.data || error.message);
      });
  };

  const cancelUpdate = () => {
    setModal(false); // Close modal on cancel
  };

  const domObj = (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.header}>
          <div className={css.headerLeft}>
            <div className={css.title}>Edit Profile</div>
          </div>
          <span className={css.closeBtn} onClick={cancelUpdate}>
            <img
              className={css.closeBtnImg}
              src={closeBtn}
              alt="close button"
            />
          </span>
        </div>
        <div className={css.bdy}>
          <Formik
            initialValues={initialValues}
            // validationSchema={validationSchema}
            onSubmit={submitForm} // Still keeping Formik's submit process if needed
          >
            {({ values }) => (
              <Form className={css.form}>
                <TextUtil name="fullName" placeholder="Enter name" />
                <TextUtil name="phone" placeholder="Enter phone number" />
                {/* <TextUtil name="address" placeholder="Enter address" /> */}
                <div className={css.btns}>
                  <WhiteBtnHov txt="Cancel" onClick={cancelUpdate} />
                  {/* Custom onClick function for update */}
                  <RedBtnHov
                    txt="Update"
                    onClick={() => handleCustomUpdate(values)}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );

  return createPortal(domObj, document.getElementById("portal"));
};

export default EditProfileModal;
