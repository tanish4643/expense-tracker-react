import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import * as dayjs from 'dayjs';

import { Messages } from 'primereact/messages';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

import BudgetListItem from '../budget/BudgetListItem';

import { budgetApiEndpoints } from '../../API';
import axios from '../../Axios';
import { getItem } from '../../Helpers';
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

let messages;

const addBudgetValidationSchema = yup.object().shape({
  month: yup.string().required('Budget month field is required'),
  amount: yup.string().required('Budget amount field is required'),
  category: yup.string().required('Category field is required').max(100, 'Budget Category must be at most 100 characters'),
});

const Budget = (props) => {
  const { register, handleSubmit, setValue, errors, setError, reset, control } = useForm({
    validationSchema: addBudgetValidationSchema
  });
  const [submitting, setSubmitting] = useState(false);
  const [recentBudget, setRecentBudget] = useState({ budget: [], budgetLoading: true });

  useEffect(() => {
    requestBudget();
  }, []);

  const requestBudget = async () => {
    await axios.get(`${budgetApiEndpoints.budget}?user_id=${getItem("user")}`, {})
      .then(response => {
        // console.log(response);
        setRecentBudget({
          ...recentBudget,
          budget: response.data,
          budgetLoading: false
        });
      })
      .catch(error => {
        console.log('error', error);
        setRecentBudget({
          ...recentBudget,
          budgetLoading: false
        });
      });
  };

  const submitBudget = (data) => {
    data = {
      user: getItem("user"),
      amount: data.amount,
      category: data.category,
      month: monthNames[new Date(data.month).getMonth()]
    };
    console.log(data)

    axios.post(budgetApiEndpoints.budget, JSON.stringify(data))
      .then(response => {
        if (response.status === 201) {
          reset();
          setSubmitting(false);
          setValue('date', dayjs(response.data.date).toDate());
          requestBudget();

          messages.show({
            severity: 'success',
            detail: 'Your budget on ' + response.data.category.name + ' added.',
            sticky: false,
            closable: false,
            life: 5000
          });
        }
      })
      .catch(error => {
        console.log('error', error.response);

        if (error.response.status === 401) {
          messages.clear();
          messages.show({
            severity: 'error',
            detail: 'Something went wrong. Try again.',
            sticky: true,
            closable: true,
            life: 5000
          });
        }
        else if (error.response.status === 400) {
          let errors = Object.entries(error.response.data).map(([key, value]) => {
            return { name: key, message: JSON.stringify(value) }
          });
          setError(errors);
        }

        setSubmitting(false)
      })
  };

  const renderRecentBudget = () => {
    if (recentBudget.budgetLoading) {
      return (
        <div className="p-grid p-nogutter p-justify-center">
          <ProgressSpinner style={{ height: '25px' }} strokeWidth={'4'} />
        </div>
      );
    }
    else {
      if (recentBudget.budget.length > 0) {
        return recentBudget.budget.map((item, index) => {
          return <BudgetListItem key={item.id} itemDetail={item} />;
        })
      }
      else {
        return (
          <div className="p-grid p-nogutter p-justify-center">
            <h4 className="color-subtitle">Create some budget records.</h4>
          </div>
        );
      }
    }
  };

  return (
    <div>
      <Helmet title="Dashboard" />

      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <div className="p-fluid">
            <Messages ref={(el) => messages = el} />
          </div>
        </div>
      </div>

      <div className="p-grid">

        <div className="p-col-12 p-md-6 p-lg-4">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Budget Info</div>
              <div className="p-card-subtitle">Enter your budget information below.</div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitBudget)}>
              <div className="p-fluid">
                <Controller
                  name="month"
                  defaultValue={new Date()}
                  onChange={([e]) => {
                    // console.log(e.value);
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Calendar
                      dateFormat="MM"
                      showButtonBar={true}
                      touchUI={window.innerWidth < 768}
                    />
                  }
                />
                <p className="text-error">{errors.month?.message}</p>
              </div>
              <div className="p-fluid">
                <input type="text" ref={register} placeholder="Category" name="category" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.category?.message}</p>
              </div>
              <div className="p-fluid">
                <div className="p-inputgroup">
                  <input type="number" step="0.00" ref={register} keyfilter="money" placeholder="Amount" name="amount" className="p-inputtext p-component p-filled" />
                </div>
                <p className="text-error">{errors.amount?.message}</p>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Add Budget" icon="pi pi-plus"
                  className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

        <div className="p-col-12 p-md-12 p-lg-8">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Recent Budgets -</div>
              <div className="p-card-subtitle">Here are few budgets you've made.</div>
            </div>
            <br />
            <div>
              {renderRecentBudget()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Budget);
