import React, { Component } from 'react';
import classNames from 'classnames';
import './styles/Tooltip.css';

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false,
      tooltipOffset: 0,
    };
  }

  render() {
    const tooltipClass = classNames(
      'tooltip',
      {
        active: this.state.showTooltip,
      }
    );

    return (
      <div ref='tooltipContainer' className='tooltip-container' style={{width: `${this.props.width}px`}} onMouseOver={this._handleMouseOver.bind(this)} onMouseOut={this._handleMouseOut.bind(this)}>
        <span>{this.props.text}</span>
        <div className={tooltipClass} style={{transform: `translate(${this.state.tooltipOffset}px, 0)`}}>{this.props.text}</div>
      </div>
    )
  }

  _handleMouseOver(e) {
    const { left } = this.refs.tooltipContainer.getBoundingClientRect();
    const offset = e.clientX - left;

    this.timeout = setTimeout(() => {
      this.setState({
        showTooltip: true,
        tooltipOffset: offset,
      });

    }, 1000);
  }

  _handleMouseOut() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.setState({
      showTooltip: false,
      tooltipOffset: 0,
    });
  }
}