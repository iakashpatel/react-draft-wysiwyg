import React, { Component } from "react";
import PropTypes from "prop-types";
import { EditorState, SelectionState, Modifier } from "draft-js";
import classNames from "classnames";
import Option from "../../components/Option";
import "./styles.css";

const getImageComponent = (config) =>
  class Image extends Component {
    static propTypes: Object = {
      block: PropTypes.object,
      contentState: PropTypes.object,
    };

    state: Object = {
      hovered: false,
    };

    removeEntity = () => {
      const { block, contentState } = this.props;

      const blockKey = block.getKey();
      const afterKey = contentState.getKeyAfter(blockKey);
      const targetRange = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: 0,
        focusKey: afterKey,
        focusOffset: 0,
      });
      let newContentState = Modifier.setBlockType(
        contentState,
        targetRange,
        "unstyled"
      );

      newContentState = Modifier.removeRange(
        newContentState,
        targetRange,
        "backward"
      );
      config.onChange(
        EditorState.push(
          config.getEditorState(),
          newContentState,
          "remove-range"
        )
      );
    };

    setEntityAlignmentLeft: Function = (): void => {
      this.setEntityAlignment("left");
    };

    setEntityAlignmentRight: Function = (): void => {
      this.setEntityAlignment("right");
    };

    setEntityAlignmentCenter: Function = (): void => {
      this.setEntityAlignment("center");
    };

    setEntityAlignment: Function = (alignment): void => {
      const { block, contentState } = this.props;
      const entityKey = block.getEntityAt(0);
      contentState.mergeEntityData(entityKey, { alignment });
      config.onChange(
        EditorState.push(
          config.getEditorState(),
          contentState,
          "change-block-data"
        )
      );
      this.setState({
        dummy: true,
      });
    };

    toggleHovered: Function = (): void => {
      this.setState((prevState) => ({
        hovered: !prevState.hovered,
      }));
    };

    renderAlignmentOptions() {
      return (
        <React.Fragment>
          <Option
            onClick={this.setEntityAlignmentLeft}
            className="rdw-image-alignment-option image-left-align-option"
          >
            L
          </Option>
          <Option
            onClick={this.setEntityAlignmentCenter}
            className="rdw-image-alignment-option image-center-align-option"
          >
            C
          </Option>
          <Option
            onClick={this.setEntityAlignmentRight}
            className="rdw-image-alignment-option image-right-align-option"
          >
            R
          </Option>
        </React.Fragment>
      );
    }

    renderDeletionOption() {
      return (
        <Option
          onClick={this.removeEntity}
          className="rdw-image-deletion-option"
        >
          X
        </Option>
      );
    }

    render(): Object {
      const { block, contentState } = this.props;
      const { hovered } = this.state;
      const {
        isReadOnly,
        isImageAlignmentEnabled,
        isImageDeletionEnabled,
      } = config;
      const entity = contentState.getEntity(block.getEntityAt(0));
      const { src, alignment, height, width, alt } = entity.getData();
      const isAlignmentEnabled = isImageAlignmentEnabled();
      const isDeletionEnabled = isImageDeletionEnabled();

      return (
        <span
          onMouseEnter={this.toggleHovered}
          onMouseLeave={this.toggleHovered}
          className={classNames("rdw-image", {
            "rdw-image-left": !alignment || alignment === "left",
            "rdw-image-right": alignment === "right",
            "rdw-image-center": alignment === "center",
          })}
        >
          <span className="rdw-image-imagewrapper">
            <img
              src={src}
              alt={alt}
              style={{
                height,
                width,
              }}
            />
          </span>
          {!isReadOnly() &&
          hovered &&
          (isAlignmentEnabled || isDeletionEnabled) ? (
            <div
              className={classNames("rdw-image-options-popup", {
                "rdw-image-options-popup-right": alignment === "right",
              })}
            >
              {isAlignmentEnabled ? this.renderAlignmentOptions() : false}
              {isDeletionEnabled ? this.renderDeletionOption() : false}
            </div>
          ) : undefined}
        </span>
      );
    }
  };

export default getImageComponent;
