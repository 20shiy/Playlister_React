import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        const { createNewListCallback } = this.props;
        createNewListCallback();
    };
    render() {
        const { canAddList, toggle } = this.props;
        let addListClass = "toolbar-button"

        let addListDisabled = true;
        if (canAddList && !toggle) {
            
            addListDisabled = false;
        } else {
            addListClass += " disabled";
        }

        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className={addListClass} 
                    disabled={addListDisabled}
                    onClick={this.handleClick}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}