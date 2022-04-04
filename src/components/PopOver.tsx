import styled from 'styled-components';

type PopoverProps = {
  direction?: 'left' | 'right' | 'top' | 'bottom';
  children?: React.ReactNode;
  show: boolean;
  popoverPosition?: number;
};
const PopOverDiv = styled.div<PopoverProps>`
  display: ${({ show }) => (show ? 'block' : 'none')};
  position: absolute;
  transform: translateX(-109%);
  top: ${({ popoverPosition }) => (popoverPosition ? `${popoverPosition}px` : 0)};
  .container {
    border: 1px solid rgba(0, 0, 0, 0.3);
    position: relative;
    background-color: black;
    padding: 16px;
    border-radius: 4px;
  }
  .container__arrow {
    height: 16px;
    width: 16px;
    background-color: black;
    position: absolute;
  }
  .container__arrow--rc {
    right: 0;
    top: 50%;

    /* Border */
    border-right: 1px solid rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(0, 0, 0, 0.3);
    transform: translate(50%, -50%) rotate(45deg);
  }
`;

const PopOver = (props: PopoverProps) => {
  return (
    <>
      <PopOverDiv
        direction={props.direction || 'left'}
        show={props.show}
        popoverPosition={props.popoverPosition}
      >
        <div className="container">
          <div className="container__arrow container__arrow--rc"></div>
          {props.children}
        </div>
      </PopOverDiv>
    </>
  );
};
export default PopOver;
