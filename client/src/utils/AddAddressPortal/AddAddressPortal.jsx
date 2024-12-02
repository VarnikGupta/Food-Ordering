import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import css from "./AddAddressPortal.module.css";

import SetDeliveryLocation from "../SetDeliveryLocation/SetDeliveryLocation";
import AddAddressForm from "../AddAddressForm/AddAddressForm";

let AddAddressPortal = ({ setAddressModal, formData }) => {
  let [page, setPage] = useState(1);
  let [searchComp, setSearchComp] = useState(false);

  const domObj = (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.formBox}>
          <AddAddressForm
            data={formData}
            setPage={setPage}
            setAddressModal={setAddressModal}
            setSearchComp={setSearchComp}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(domObj, document.getElementById("portal"));
};

export default AddAddressPortal;
