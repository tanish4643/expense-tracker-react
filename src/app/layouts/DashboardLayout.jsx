import React, { useState } from 'react'
import classNames from 'classnames';
import { Route, Switch } from 'react-router-dom';

import { ScrollPanel } from 'primereact/scrollpanel';

import AppInlineProfile from './../dashboard/AppInlineProfile';
import AppMenu from './../dashboard/AppMenu';
import AppFooter from './../dashboard/AppFooter';

import Dashboard from './../dashboard/Dashboard';
import Expense from './../expense/Expense';
import Income from './../income/Income';
import ScrollToTop from './../dashboard/ScrollToTop';
import PageNotFound from './../errors/404';

import { logout } from './../../Axios';
import { PrivateRoute } from './../../Routes';
import { useTracked } from './../../Store';
import Budget from '../budget/Budget';

const isDesktop = () => {
  return window.innerWidth > 1024;
};

const menu = [
  { label: 'Dashboard', url: '/dashboard', icon: 'pi pi-fw pi-home', command: () => { } },
  { label: 'Expense', url: '/expense', icon: 'pi pi-fw pi-dollar', command: () => { } },
  { label: 'Income', url: '/income', icon: 'pi pi-fw pi-money-bill', command: () => { } },
  { label: 'Budget', url: '/budget', icon: 'pi pi-fw pi-dollar', command: () => { } },
  { label: 'Logout', url: '', icon: 'pi pi-fw pi-power-off', command: () => logout() },
];

const DashboardLayout = (props) => {

  const [state] = useTracked();

  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  const onToggleMenu = () => {
    if (isDesktop()) {
      if (state.layoutMode === 'overlay') {
        setOverlayMenuActive(!overlayMenuActive);
      }
      else if (state.layoutMode === 'static') {
        setStaticMenuInactive(!staticMenuInactive);
      }
    }
    else {
      setMobileMenuActive(!mobileMenuActive)
    }
  }

  /**
   * If menu item has no child, this function will
   * close the menu on item click. Else it will
   * open the child drawer.
   */
  const onMenuItemClick = (event) => {
    if (!event.item.items) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }
  }

  let logo = state.layoutColorMode === 'dark' ? require('./../../assets/logo-sidebar.png') : require('./../../assets/logo-sidebar.png');
  let wrapperClass = classNames('layout-wrapper', 'layout-static', 'layout-overlay-sidebar-active');

  return (
    <div className={wrapperClass}>
      
      <div className="layout-sidebar">
        <ScrollPanel style={{ height: '100%' }}>
          <div className="layout-sidebar-scroll-content">
            <div className="layout-logo">
              <img alt="Logo" src={logo} style={{ height: '80px' }} />
            </div>
            <AppInlineProfile />
            <AppMenu model={menu} onMenuItemClick={onMenuItemClick} />
          </div>
        </ScrollPanel>
      </div>
      <div className="layout-main" style={{ minHeight: '100vh', marginBottom: '-55px' }}>
        <Switch>
          <PrivateRoute exact strict path={'/dashboard'} component={Dashboard} />
          <PrivateRoute exact strict path={'/expense'} component={Expense} />
          <PrivateRoute exact strict path={'/income'} component={Income} />
          <PrivateRoute exact strict path={'/budget'} component={Budget} />
          <Route render={props => <PageNotFound {...props} />} />
        </Switch>
        <div style={{ height: '55px' }}>
          {/* For footer adjustment */}
        </div>
        <ScrollToTop />
      </div>
      <AppFooter />
      <div className="layout-mask" />
    </div>
  );
}

export default DashboardLayout;
