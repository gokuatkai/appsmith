import React from "react";
import { ComponentProps } from "widgets/BaseComponent";
import { TextSize } from "constants/WidgetConstants";
import { Alignment, Intent, IconName } from "@blueprintjs/core";
import _ from "lodash";
import { InputType, InputTypes } from "../constants";

import CurrencyTypeDropdown, {
  CurrencyDropdownOptions,
  getSelectedCurrency,
} from "./CurrencyCodeDropdown";
import BaseInputComponent from "../../BaseInputWidget/component";

class CurrencyInputComponent extends React.Component<
  CurrencyInputComponentProps
> {
  constructor(props: CurrencyInputComponentProps) {
    super(props);
  }

  onChange = (valueAsString: string) => {
    const fractionDigits = this.props.decimalsInCurrency || 0;
    const currentIndexOfDecimal = valueAsString.indexOf(".");
    const indexOfDecimal = valueAsString.length - fractionDigits - 1;
    if (
      valueAsString.includes(".") &&
      currentIndexOfDecimal <= indexOfDecimal
    ) {
      let value = valueAsString.split(",").join("");
      if (value) {
        const locale = navigator.languages?.[0] || "en-US";
        const formatter = new Intl.NumberFormat(locale, {
          style: "decimal",
          minimumFractionDigits: fractionDigits,
        });
        const decimalValueArray = value.split(".");
        //remove extra digits after decimal point
        if (
          this.props.decimalsInCurrency &&
          decimalValueArray[1].length > this.props.decimalsInCurrency
        ) {
          value =
            decimalValueArray[0] +
            "." +
            decimalValueArray[1].substr(0, this.props.decimalsInCurrency);
        }
        const formattedValue = formatter.format(parseFloat(value));
        this.props.onValueChange(formattedValue);
      } else {
        this.props.onValueChange("");
      }
    } else {
      this.props.onValueChange(valueAsString);
    }
  };

  getLeftIcon = () => {
    const selectedCurrencyCountryCode = getSelectedCurrency(
      this.props.currencyCountryCode,
    );
    return (
      <CurrencyTypeDropdown
        allowCurrencyChange={
          this.props.allowCurrencyChange && !this.props.disabled
        }
        onCurrencyTypeChange={this.props.onCurrencyTypeChange}
        options={CurrencyDropdownOptions}
        selected={selectedCurrencyCountryCode}
      />
    );
  };

  onKeyDown = (
    e:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (typeof this.props.onKeyDown === "function") {
      this.props.onKeyDown(e);
    }
  };

  render() {
    return (
      <BaseInputComponent
        autoFocus={this.props.autoFocus}
        compactMode={this.props.compactMode}
        defaultValue={this.props.defaultValue}
        disableNewLineOnPressEnterKey={this.props.disableNewLineOnPressEnterKey}
        disabled={this.props.disabled}
        errorMessage={this.props.errorMessage}
        fill={this.props.fill}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        inputHTMLType="NUMBER"
        inputType={InputTypes.PHONE_NUMBER}
        intent={this.props.intent}
        isInvalid={this.props.isInvalid}
        isLoading={this.props.isLoading}
        label={this.props.label}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        leftIcon={this.getLeftIcon()}
        multiline={false}
        onFocusChange={this.props.onFocusChange}
        onKeyDown={this.onKeyDown}
        onValueChange={this.onChange}
        placeholder={this.props.placeholder}
        showError={this.props.showError}
        tooltip={this.props.tooltip}
        value={this.props.value}
        widgetId={this.props.widgetId}
      />
    );
  }
}

export interface CurrencyInputComponentProps extends ComponentProps {
  value: string;
  inputType: InputType;
  disabled?: boolean;
  intent?: Intent;
  defaultValue?: string | number;
  currencyCountryCode?: string;
  noOfDecimals?: number;
  allowCurrencyChange?: boolean;
  decimalsInCurrency?: number;
  label: string;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  tooltip?: string;
  leftIcon?: IconName;
  allowNumericCharactersOnly?: boolean;
  fill?: boolean;
  errorMessage?: string;
  maxChars?: number;
  maxNum?: number;
  minNum?: number;
  onValueChange: (valueAsString: string) => void;
  onCurrencyTypeChange: (code?: string) => void;
  stepSize?: number;
  placeholder?: string;
  isLoading: boolean;
  multiline: boolean;
  compactMode: boolean;
  isInvalid: boolean;
  autoFocus?: boolean;
  iconName?: IconName;
  iconAlign?: Omit<Alignment, "center">;
  showError: boolean;
  onFocusChange: (state: boolean) => void;
  disableNewLineOnPressEnterKey?: boolean;
  onKeyDown?: (
    e:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  widgetId: string;
}

export default CurrencyInputComponent;
