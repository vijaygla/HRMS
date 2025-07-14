// components/AddEmployeeModal.tsx
import {
  Dialog, Transition,
} from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { useEffect, useState, Fragment } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// 1️⃣ Validation schema
const schema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().refine((d) => dayjs(d).isValid(), 'Invalid date'),
    gender: z.enum(['male', 'female', 'other']),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
    nationality: z.string(),
    phone: z.string(),
    emergencyContact: z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(1),
    }),
  }),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  jobInfo: z.object({
    department: z.string().min(1),
    position: z.string().min(1),
    employmentType: z.enum(['full-time', 'part-time', 'contract']),
    joinDate: z.string(),
    workLocation: z.enum(['office', 'remote', 'hybrid']),
  }),
  salary: z.object({
    baseSalary: z.number().min(0),
    currency: z.string().length(3),
    payFrequency: z.enum(['monthly', 'bi-weekly', 'weekly']),
  }),
  benefits: z.object({
    healthInsurance: z.boolean(),
    dentalInsurance: z.boolean(),
    visionInsurance: z.boolean(),
    retirement401k: z.boolean(),
  }),
  userInfo: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['employee', 'admin', 'hr']),
  }),
});

export type NewEmployeePayload = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // callback => refetch list
}

const AddEmployeeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewEmployeePayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      benefits: {
        healthInsurance: true,
        dentalInsurance: false,
        visionInsurance: false,
        retirement401k: true,
      },
      userInfo: { role: 'employee' } as any,
    },
  });

  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);

  // Pull departments once
  useEffect(() => {
    (async () => {
      const res = await departmentService.getDepartments();
      if (res?.success) setDepartments(res.data);
    })();
  }, []);

  const onSubmit = async (data: NewEmployeePayload) => {
    try {
      await employeeService.createEmployee(data);
      toast.success('Employee created 🎉');
      reset();
      onClose();
      onSuccess();
    } catch (e) {
      /* global interceptor already shows toast */
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg">
              <Dialog.Title className="text-xl font-semibold mb-4">
                Add new employee
              </Dialog.Title>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 max-h-[75vh] overflow-y-auto pr-2"
              >
                {/* Personal Information */}
                <section>
                  <h3 className="font-medium text-gray-800 mb-2">Personal info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First name</label>
                      <input {...register('personalInfo.firstName')} className="input" />
                      {errors.personalInfo?.firstName && (
                        <p className="error">{errors.personalInfo.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Last name</label>
                      <input {...register('personalInfo.lastName')} className="input" />
                    </div>
                    <div>
                      <label className="label">Date of birth</label>
                      <input type="date" {...register('personalInfo.dateOfBirth')} className="input" />
                    </div>
                    <div>
                      <label className="label">Gender</label>
                      <select {...register('personalInfo.gender')} className="input">
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {/* Phone, maritalStatus, nationality ... add the rest similarly */}
                  </div>
                </section>

                {/* Address */}
                <section>
                  <h3 className="font-medium text-gray-800 mb-2">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input {...register('address.street')} placeholder="Street" className="input" />
                    <input {...register('address.city')} placeholder="City" className="input" />
                    <input {...register('address.state')} placeholder="State" className="input" />
                    <input {...register('address.zipCode')} placeholder="Zip" className="input" />
                    <input {...register('address.country')} placeholder="Country" className="input col-span-full" />
                  </div>
                </section>

                {/* Job Info */}
                <section>
                  <h3 className="font-medium text-gray-800 mb-2">Job info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select {...register('jobInfo.department')} className="input">
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <input {...register('jobInfo.position')} placeholder="Position" className="input" />
                    <select {...register('jobInfo.employmentType')} className="input">
                      <option value="full-time">Full‑time</option>
                      <option value="part-time">Part‑time</option>
                      <option value="contract">Contract</option>
                    </select>
                    <input type="date" {...register('jobInfo.joinDate')} className="input" />
                    <select {...register('jobInfo.workLocation')} className="input">
                      <option value="office">Office</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </section>

                {/* Salary */}
                <section>
                  <h3 className="font-medium text-gray-800 mb-2">Salary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      {...register('salary.baseSalary', { valueAsNumber: true })}
                      placeholder="Base salary"
                      className="input"
                    />
                    <input {...register('salary.currency')} placeholder="Currency e.g. USD" className="input" />
                    <select {...register('salary.payFrequency')} className="input">
                      <option value="monthly">Monthly</option>
                      <option value="bi-weekly">Bi‑weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </section>

                {/* Benefits */}
                <section>
                  <h3 className="font-medium text-gray-800 mb-2">Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="inline-flex gap-2 items-center">
                      <input type="checkbox" {...register('benefits.healthInsurance')} />
                      Health insurance
                    </label>
                    <label className="inline-flex gap-2 items-center">
                      <input type="checkbox" {...register('benefits.dentalInsurance')} />
                      Dental
                    </label>
                    <label className="inline-flex gap-2 items-center">
                      <input type="checkbox" {...register('benefits.visionInsurance')} />
                      Vision
                    </label>
                    <label className="inline-flex gap-2 items-center">
                      <input type="checkbox" {...register('benefits.retirement401k')} />
                      401(k)
                    </label>
                  </div>
                </section>

                {/* User login */}
                <section>
                  <h3 className="font-medium text-gray-800 mb-2">Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input {...register('userInfo.email')} placeholder="Email" className="input" />
                    <input type="password" {...register('userInfo.password')} placeholder="Password" className="input" />
                    <select {...register('userInfo.role')} className="input">
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="hr">HR</option>
                    </select>
                  </div>
                </section>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving…' : 'Create employee'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddEmployeeModal;
