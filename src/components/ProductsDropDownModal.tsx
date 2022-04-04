import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
const SelectedButton = styled.button`
  background-color: #04aa6d;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
`;
const DropDownDiv = styled.div`
  /* The container <div> - needed to position the dropdown content */
  position: relative;
  display: inline-block;

  /* Dropdown Content (Hidden by Default) */
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f1f1f1;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  /* Links inside the dropdown */
  .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  /* Change color of dropdown links on hover */
  .dropdown-content a:hover {
    background-color: #ddd;
  }

  /* Show the dropdown menu on hover */
  &:hover .dropdown-content {
    display: block;
  }

  /* Change the background color of the dropdown button when the dropdown content is shown */
  &:hover .dropbtn {
    background-color: #3e8e41;
  }
`;
type ProductsDropDownModalProps = {
  dropDownOptions: string[];
  selectedProduct?: string;
};
const ProductsDropDownModal = ({
  dropDownOptions,
  selectedProduct = dropDownOptions[0]
}: ProductsDropDownModalProps) => {
  const { pathname } = useLocation();
  return (
    <DropDownDiv>
      <SelectedButton>
        <span>{selectedProduct}</span>
      </SelectedButton>
      <div className="dropdown-content" role="listbox">
        {dropDownOptions.map((target, index) => (
          <Link to={`/${target}`} state={{ from: pathname.substring(1) }} role="option" key={index}>
            {target}
          </Link>
        ))}
      </div>
    </DropDownDiv>
  );
};
export default ProductsDropDownModal;
