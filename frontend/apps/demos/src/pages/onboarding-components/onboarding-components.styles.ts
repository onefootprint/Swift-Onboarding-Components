import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  .fp-input  {
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 150%;
    height: 40px;
    padding-left: 16px;
    padding-right: 16px;
    background: rgb(255, 255, 255);
    border-color: rgb(212, 212, 212);
    border-radius: 6px;
    border-style: solid;
    border-width: 1px;
    color: rgb(0, 0, 0);
    outline: none;
    width: 100%;

    &:hover {
      background: rgb(255, 255, 255);
      border-color: rgb(169, 169, 169);
      box-shadow: none;
    }

    &:focus {
      background: rgb(255, 255, 255);
      border-color: rgb(74, 36, 219);
      box-shadow: rgba(74, 36, 219, 0.12) 0px 0px 0px 4px;
    }

    &[aria-invalid='true'] {
      background: rgb(255, 255, 255);
      border-color: rgb(191, 20, 10);
      box-shadow: rgba(191, 20, 10, 0.12) 0px 0px 0px 4px;

      &:hover {
        background: rgb(255, 255, 255);
        border-color: rgb(153, 16, 8);
        box-shadow: none;
      }

      &:focus {
        background: rgb(255, 255, 255);
        border-color: rgb(191, 20, 10);
        box-shadow: rgba(191, 20, 10, 0.12) 0px 0px 0px 4px;
      }
    }
  }
  
  .fp-select {
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 150%;
    appearance: none;
    background-color: rgb(255, 255, 255);
    background-image: url(data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.23966 5.70041C4.5432 5.41856 5.01775 5.43613 5.2996 5.73966L8 8.64779L10.7004 5.73966C10.9823 5.43613 11.4568 5.41856 11.7603 5.70041C12.0639 5.98226 12.0815 6.45681 11.7996 6.76034L8.5496 10.2603C8.40769 10.4132 8.20855 10.5 8 10.5C7.79145 10.5 7.59232 10.4132 7.45041 10.2603L4.20041 6.76034C3.91856 6.45681 3.93613 5.98226 4.23966 5.70041Z' fill='black'/%3E%3C/svg%3E%0A);
    background-position: calc(100% - 12px) center;
    background-repeat: no-repeat;
    border-color: rgb(212, 212, 212);
    border-radius: 6px;
    border-style: solid;
    border-width: 1px;
    color: rgb(0, 0, 0);
    height: 40px;
    outline: none;
    padding-inline: 12px;
    resize: none;
    width: 100%;
  }

  .fp-label {
    margin-bottom: 8px;
    display: block;
  }

  .fp-message {
    font-family: inherit;
    font-weight: 400;
    font-size: 0.9375rem;
    line-height: 150%;
    margin-top: 4px;

    &[aria-invalid='true'] {
      color: rgb(153, 16, 8);
    }
  }

  .fp-address-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

export default GlobalStyles;
