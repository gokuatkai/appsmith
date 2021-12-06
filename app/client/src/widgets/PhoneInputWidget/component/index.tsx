import React from "react";
import { ComponentProps } from "widgets/BaseComponent";
import { TextSize } from "constants/WidgetConstants";
import { Alignment, Intent, IconName } from "@blueprintjs/core";
import _ from "lodash";
import { InputType, InputTypes } from "../constants";
import ISDCodeDropdown, {
  ISDCodeDropdownOptions,
  getSelectedISDCode,
} from "./ISDCodeDropdown";
import BaseInputComponent from "widgets/BaseInputWidget/component";

class PhoneInputComponent extends React.Component<PhoneInputComponentProps> {
  constructor(props: PhoneInputComponentProps) {
    super(props);
    this.state = { showPassword: false };
  }

  onTextChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    this.props.onValueChange(event.target.value);
  };

  getLeftIcon = () => {
    const selectedISDCode = getSelectedISDCode(this.props.countryCode);
    return (
      <ISDCodeDropdown
        disabled={!!this.props.disabled}
        onISDCodeChange={this.props.onISDCodeChange}
        options={ISDCodeDropdownOptions}
        selected={selectedISDCode}
      />
    );
  };

  onKeyDownTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isEnterKey = e.key === "Enter" || e.keyCode === 13;
    const { disableNewLineOnPressEnterKey } = this.props;
    if (isEnterKey && disableNewLineOnPressEnterKey && !e.shiftKey) {
      e.preventDefault();
    }
    if (typeof this.props.onKeyDown === "function") {
      this.props.onKeyDown(e);
    }
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        inputHTMLType="TEXT"
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
        onKeyDown={this.props.onKeyDown}
        onValueChange={this.props.onValueChange}
        placeholder={this.props.placeholder}
        showError={this.props.showError}
        tooltip={this.props.tooltip}
        value={this.props.value}
        widgetId={this.props.widgetId}
      />
    );
  }
}

export interface PhoneInputComponentProps extends ComponentProps {
  value: string;
  disabled?: boolean;
  intent?: Intent;
  defaultValue?: string | number;
  countryCode?: string;
  label: string;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  tooltip?: string;
  leftIcon?: IconName;
  fill?: boolean;
  errorMessage?: string;
  onValueChange: (valueAsString: string) => void;
  onISDCodeChange: (code?: string) => void;
  placeholder?: string;
  isLoading: boolean;
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

export default PhoneInputComponent;
