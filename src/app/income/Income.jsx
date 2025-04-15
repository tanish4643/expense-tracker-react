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

import IncomeListItem from './../income/IncomeListItem';

import { incomeApiEndpoints } from './../../API';
import axios from './../../Axios';
import { getItem } from '../../Helpers';

let messages;

const addIncomeValidationSchema = yup.object().shape({
  date: yup.string().required('Income date field is required'),
  amount: yup.string().required('Income amount field is required'),
  category: yup.string().required('Source field is required').max(100, 'Source on must be at most 100 characters'),
});

const Income = (props) => {
  const { register, handleSubmit, setValue, errors, setError, reset, control } = useForm({
    validationSchema: addIncomeValidationSchema
  });
  const [submitting, setSubmitting] = useState(false);
  const [recentIncome, setRecentIncome] = useState({ income: [], incomeLoading: true });

  useEffect(() => {
    requestIncome();
  }, []);

  const requestIncome = async () => {
    await axios.get(`${incomeApiEndpoints.income}?user_id=${getItem("user")}`, {})
      .then(response => {
        // console.log(response.data);
        setRecentIncome({
          ...recentIncome,
          income: response.data,
          incomeLoading: false
        });
      })
      .catch(error => {
        console.log('error', error);
        setRecentIncome({
          ...recentIncome,
          incomeLoading: false
        });
      });
  };

  const submitIncome = (data) => {
    try {
      data = {
        user: getItem("user"),
        amount: data.amount,
        category: {
          type: "income",
          name: data.category
        },
        date: dayjs(data.date).format('YYYY-MM-DD')
      };
    }
    catch(e){
      console.log(e);
    }

    console.log(data);

    axios.post(incomeApiEndpoints.income, JSON.stringify(data))
      .then(response => {
        if (response.status === 201) {
          reset();
          setSubmitting(false);
          setValue('date', dayjs(response.data.date).toDate());
          requestIncome();

          messages.show({
            severity: 'success',
            detail: 'Your income on ' + response.data.category.name + ' added.',
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
          console.log(errors);
          setError(errors);
        }

        setSubmitting(false)
      })
  };

  const renderRecentIncome = () => {
    if (recentIncome.incomeLoading) {
      return (
        <div className="p-grid p-nogutter p-justify-center">
          <ProgressSpinner style={{ height: '25px' }} strokeWidth={'4'} />
        </div>
      );
    }
    else {
      if (recentIncome.income.length > 0) {
        return recentIncome.income.map((item, index) => {
          return <IncomeListItem key={item.id} itemDetail={item} />;
        })
      }
      else {
        return (
          <div className="p-grid p-nogutter p-justify-center">
            <h4 className="color-subtitle">Add some earnings to see recent.</h4>
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
              <div className="p-card-title p-grid p-nogutter p-justify-between">Income Info</div>
              <div className="p-card-subtitle">Enter your income information below.</div>
            </div>
            <br />
            <form onSubmit={handleSubmit(submitIncome)}>
              <div className="p-fluid">
                <Controller
                  name="date"
                  defaultValue={new Date()}
                  onChange={([e]) => {
                    // console.log(e);
                    return e.value;
                  }}
                  control={control}
                  as={
                    <Calendar
                      dateFormat="yy-mm-dd"
                      showButtonBar={true}
                      maxDate={new Date()}
                      touchUI={window.innerWidth < 768}
                    />
                  }
                />
                <p className="text-error">{errors.date?.message}</p>
              </div>
              <div className="p-fluid">
                <input type="text" ref={register} placeholder="Source" name="category" className="p-inputtext p-component p-filled" />
                <p className="text-error">{errors.category?.message}</p>
              </div>
              <div className="p-fluid">
                <div className="p-inputgroup">
                  <input type="number" step="0.00" ref={register} keyfilter="money" placeholder="Amount" name="amount" className="p-inputtext p-component p-filled" />
                </div>
                <p className="text-error">{errors.amount?.message}</p>
              </div>
              <div className="p-fluid">
                <Button disabled={submitting} type="submit" label="Add Income" icon="pi pi-plus"
                  className="p-button-raised" />
              </div>
            </form>
          </Card>
        </div>

        <div className="p-col-12 p-md-12 p-lg-8">
          <Card className="rounded-border">
            <div>
              <div className="p-card-title p-grid p-nogutter p-justify-between">Recent Incomes +</div>
              <div className="p-card-subtitle">Here are few incomes you've added.</div>
            </div>
            <br />
            <div>
              {renderRecentIncome()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Income);
