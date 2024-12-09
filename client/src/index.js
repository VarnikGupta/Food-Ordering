import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { Store } from './components/Redux/Store';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={Store}>
    <BrowserRouter>
      <Header />
      <App />
      <Footer />
    </BrowserRouter>
   </Provider>
);


// 1. Home Page
//   a. profile ka dropdown implement krna hai							                                    MEDIUM	DONE
//   b. add restaurant ka option dena hai navbar main						                                EASY	DONE

// 2. Search Page
//   a. pura he implement krna hai									                                            HARD	DONE
//   b. filters bache hai abhi									                                                MEDIUM  PENDING

// 3. Restaurant Page
//   a. menu main add to cart ki jagah counter dikhana hai						                          EASY	PENDING
//   b. reviews main pagination daalna hai								                                      MEDIUM	DONE

// 4. Cart page
//   a. scrolling issue dekhna hai									                                            HARD	DONE
//   b. order krne pe address puchna chahiye							                                      MEDIUM	PENDING
//   c. order krne pe cart clear ho jaani chahiye 							                                EASY	PENDING
//   d. ek close icon bhi dena hai									                                            EASY	PENDING
//   e. cart override pe warning									                                              MEDIUM	PENDING

// 5. Signup
//   a. contact aur address bhi mandatory hai signup ke time					                          EASY	PENDING

// 6. New Restaurant
//   a. ek dialog implement krna hai bs								                                          EASY	DONE

// 7. User Page
//   a. reviews main pagination daalna hai								                                      MEDIUM	PENDING
//   b. order history main bhi pagination								                                        MEDIUM	DONE
//   c. favourite orders main bhi pagination							                                      MEDIUM	DONE
//   d. addresses wala section bhi show krna hai							                                  EASY	PENDING
//   e. order status change krwana hai								                                          MEDIUM  DONE

// 8. Update user profile 
//   a. jb api ki update call hogi tb local storage main bhi update krna hai if name is updated	EASY	DONE
//   b. validation ke bina api call nhi hogi							                                      EASY	DONE
//   c. address updation										                                                    MEDIUM  PENDING

// 9. Delete user
//   a. pura workflow he implement krna hai							                                        EASY	DONE
//   b. pending orders wala edge case								                                            EASY	DONE

// 10. common middleware bnana hai taaki token expiration ke time logout ho jaaye			          EASY	PENDING

// 11. saari api's ek jagah list krni hai								                                        EASY	PENDING

// 12. Admin Page
//   a. pura he workflow implement krna hai 							                                      HARD	DONE
//   b. userId dikhani hai orders page pe 								                                      EASY 	DONE