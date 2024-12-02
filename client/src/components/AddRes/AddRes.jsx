import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import css from "./Addres.module.css";
import closeBtn from "../../utils/images/closeBtn.jpg";
import RedBtnHov from "../../utils/RedBtnHov/RedBtnHov";
import WhiteBtnHov from "../../utils/WhiteBtnHov/WhiteBtnHov";
import TextUtil from "../../utils/TextUtil/TextUtil";
import AddAddressPortal from "../../utils/AddAddressPortal/AddAddressPortal";

const AddRes = ({ setModal }) => {
  const [initialValues] = useState({
    fullName: "",
    phone: "",
  });

  const [addModal, setAddModal] = useState(false);
  const [data, setData] = useState("");

  const handleOpenNextDialog = (values) => {
    if (!values.fullName || !values.phone || values.phone.length !== 10) {
      alert("Please provide all fields.");
      return;
    }
    if (!/^\d{10}$/.test(values.phone)) {
      alert("Please provide valid phone number");
      return;
    }

    // Store the form data in modalData state to pass it to the next modal
    setAddModal(true);
    setData(values);
  };

  const cancelUpdate = () => {
    setModal(false); // Close the first modal
  };

  return (
    <>
      <div className={css.outerDiv}>
        <div className={css.innerDiv}>
          <div className={css.header}>
            <div className={css.headerLeft}>
              <div className={css.title}>Add Restaurant</div>
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
              //   validationSchema={validationSchema}
            >
              {({ values }) => (
                <Form className={css.form}>
                  <TextUtil
                    name="fullName"
                    placeholder="Enter restaurant name"
                  />
                  <TextUtil name="phone" placeholder="Enter contact number" />
                  <div className={css.btns}>
                    <WhiteBtnHov txt="Cancel" onClick={cancelUpdate} />
                    <RedBtnHov
                      txt="Next"
                      onClick={() => handleOpenNextDialog(values)} // Open next dialog
                    />
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      {addModal && (
        <AddAddressPortal
          setAddressModal={() => {
            setAddModal(false);
            setModal(false);
          }} // Close the second modal
          formData={data} // Pass form data to the next modal
        />
      )}
    </>
  );
};

export default AddRes;
