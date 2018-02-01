import PropTypes from "prop-types";
import React, { Component } from "react";

const baseClassName = "cdl-ppnav";

const defaultRenderMenuItem = props => {
  const { itemDetails, captureRef, clickHandler, activeClass } = props;
  const { uri, label, isActive } = itemDetails;

  return (
    <li className={isActive ? activeClass : ""} key={uri} ref={captureRef} onClick={clickHandler}>
      <a href={uri}>{label}</a>
    </li>
  );
};

defaultRenderMenuItem.propTypes = {
  itemDetails: PropTypes.object,
  captureRef: PropTypes.func,
  clickHandler: PropTypes.func,
  activeClass: PropTypes.string,
};

class PriorityPlusNav extends Component {
  state = {
    items: [],
    itemRefs: [],
    activeItems: [],
    inactiveItems: [],
    overflowActive: false,
  };

  parentNode = null;
  overflowButton = null;
  spaceTester = null;
  itemRefs = [];
  itemMargin = 0;

  updateMenuItems = items => {
    const itemRefs = this.state.itemRefs;

    if (items.length < 1) {
      return;
    }

    if (itemRefs.length < 1) {
      this.setState({
        activeItems: items,
      });

      return;
    }

    let totalWidth = 0;
    const parentWidth = this.parentNode.offsetWidth;
    const overflowedIndex = items.findIndex((item, index) => {
      totalWidth = totalWidth +
        itemRefs[index].offsetWidth +
        this.itemMargin;

      return totalWidth > parentWidth;
    });

    const active = items.slice(0, overflowedIndex === -1 ? items.length : overflowedIndex);

    // If some elements are wrapped, make sure there's room for the overflow button
    if (active.length < items.length) {
      if (
        totalWidth + this.itemMargin + this.overflowButton.offsetWidth >=
        parentWidth
      ) {
        active.pop();
      }
    }

    // If there's only one overflowed item, pop it's sibling
    // This ensures at least two elements are in the overflow.
    if (items.length - active.length === 1) {
      active.pop();
    }

    // set inactive elements
    const inactive = items.slice(active.length);

    this.setState({
      activeItems: active,
      inactiveItems: inactive,
    });
  };

  handleMenuItemClick = () => {
    if (this.state.overflowActive) {
      this.setState({
        overflowActive: false,
      });
    }
  };

  componentWillMount() {
    const { menuItems, renderMenuItem = defaultRenderMenuItem } = this.props;

    const mappedMenuItems = menuItems.map((item, index) =>
      renderMenuItem({
        itemDetails: item,
        captureRef: li => {
          this.itemRefs[index] = li;
        },
        clickHandler: this.handleMenuItemClick,
        activeClass: `${baseClassName}__item--active`,
      })
    );

    this.setState({
      items: mappedMenuItems,
      itemRefs: this.itemRefs,
    });

    this.updateMenuItems(mappedMenuItems);
  }

  componentDidMount() {
    this.setState({
      itemRefs: this.itemRefs,
    });

    if (this.itemRefs.length > 1) {
      this.itemMargin = parseInt(window.getComputedStyle(this.itemRefs[1]).marginLeft);
    }

    this.updateMenuItems(this.state.items);

    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  toggleExtendedMenu = () => {
    this.setState({
      overflowActive: !this.state.overflowActive,
    });
  };

  handleResize = () => {
    this.updateMenuItems(this.state.items);
  };

  handleOverflowMenuClick = event => {
    event.preventDefault();
    this.toggleExtendedMenu();
    return false;
  };

  render() {
    const { MenuText = "Menu", MoreText = "More", className } = this.props;

    const { activeItems, overflowActive, inactiveItems } = this.state;

    return (
      <nav
        className={`${baseClassName} ${className ? className : ""}`}
        ref={nav => (this.parentNode = nav)}
      >
        {/*
          displayed so we can calculate menu item widths as they'd normally be displayed in the top menu
        */}
        <ul className={`${baseClassName}__hiddenNav`} aria-hidden="true">
          {inactiveItems}
        </ul>
        <ul>
          {activeItems}
          <li
            className={`${baseClassName}__indicator`}
            aria-hidden={inactiveItems.length < 1}
            ref={li => (this.overflowButton = li)}
          >
            <a
              href="#all-nav"
              className={`${baseClassName}__button ${
                activeItems.length > 0 ? "" : `${baseClassName}__button--compact`
              }`}
              onClick={this.handleOverflowMenuClick}
            >
              {activeItems.length > 0 ? MoreText : MenuText}
            </a>
            <ul className={`${baseClassName}__list`} aria-hidden={!overflowActive}>
              {inactiveItems}
            </ul>
          </li>
        </ul>
      </nav>
    );
  }
}

PriorityPlusNav.propTypes = {
  renderMenuItem: PropTypes.func,
  MenuText: PropTypes.string,
  MoreText: PropTypes.string,
  menuItems: PropTypes.array,
  className: PropTypes.string,
};

export default PriorityPlusNav;