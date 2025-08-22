// client/src/pages/course/components/PendingRequestsCard.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { ZBulkRegistrationSchema } from '@codewit/validations';
import type { Pending } from '../TeacherView';

interface Props {
  courseId: string;
  pending: Pending[];
}

async function bulkAction(courseId: string, payload: ZBulkRegistrationSchema) {
  const { data } = await axios.post(
    `/api/courses/${courseId}/registrations/bulk`,
    payload
  );
  return data as { action: 'enroll' | 'deny'; uids: number[] };
}

export default function PendingRequestsCard({ courseId, pending }: Props) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { mutate: mutateBulk, isPending } = useMutation<
    { action: 'enroll' | 'deny'; uids: number[] },
    unknown,
    ZBulkRegistrationSchema
  >({
    mutationFn: (vars) => bulkAction(courseId, vars),
    onSuccess: ({ action, uids }) => {
      toast.success(`${action === 'enroll' ? 'Enrolled' : 'Denied'} ${uids.length} student(s)`);
      queryClient.invalidateQueries({ queryKey: ['pending', courseId] });
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      setSelected(new Set());
    },
    onError: () => toast.error('Failed to update registrations'),
  });

  const allChecked = pending.length > 0 && selected.size === pending.length;

  function toggle(uid: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(pending.map((p) => p.uid)));
  }

  return (
    <div className="bg-foreground-600 rounded-md p-4 space-y-3 w-full">
      <div className="flex items-center justify-end">
        <button
          type="button"
          title="Toggle selection of all pending requests in the list"
          onClick={toggleAll}
          className="px-3 py-1.5 rounded-md border border-foreground-400/30 bg-foreground-500/30 hover:bg-foreground-500/50 transition"
        >
          {allChecked ? 'Clear All' : 'Select All'}
        </button>
      </div>

      {/* Table */}
      <div className="max-h-[300px] overflow-auto rounded-md">
        <table className="w-full text-left text-foreground-200 text-sm table-fixed border-collapse">
          <thead className="sticky top-0 bg-foreground-600 z-10">
            <tr className="border-b border-foreground-400/30">
              <th className="w-10 px-2"></th>
              <th className="py-1 px-2">Username</th>
              <th className="py-1 px-2">Email</th>
              <th className="py-1 px-2">Requested</th>
              <th className="py-1 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((p, idx) => {
              const isRowSelected = selected.has(p.uid);

              return (
                <tr
                  key={p.uid}
                  onClick={(e) => {
                    // Don’t toggle twice if the click originated on the checkbox
                    if ((e.target as HTMLElement).tagName !== 'INPUT') toggle(p.uid);
                  }}
                  className={`cursor-pointer hover:bg-foreground-500/10 ${idx === pending.length - 1 ? '' : 'border-b border-foreground-400/20'}`}
                >
                  <td className="w-10 py-2 px-2">
                    <input
                      type="checkbox"
                      checked={isRowSelected}
                      onChange={() => toggle(p.uid)}
                      className="h-4 w-4 accent-accent-500"
                      aria-label={`Select ${p.username}`}
                    />
                  </td>

                  <td className="py-2 px-2 font-medium text-foreground-100">{p.username}</td>
                  <td className="py-2 px-2 text-foreground-100">{p.email}</td>
                  <td className="py-2 px-2 text-foreground-100">
                    {new Date(p.requested).toLocaleDateString()}
                  </td>

                  {/* Action buttons */}
                  <td className="py-2 px-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        title="Enroll this user"
                        onClick={(e) => {
                          e.stopPropagation();
                          mutateBulk({ action: 'enroll', uids: [p.uid] });
                        }}
                        disabled={isPending}
                        className="px-2 py-1 text-xs rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-40"
                      >
                        Enroll
                      </button>
                      <button
                        type="button"
                        title={"Deny this request"}
                        onClick={(e) => {
                          e.stopPropagation();
                          mutateBulk({ action: 'deny', uids: [p.uid] });
                        }}
                        disabled={isPending}
                        className="px-2 py-1 text-xs rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-40"
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-3 border-t border-foreground-400/30">
        <div className="text-sm text-foreground-300">
          {selected.size} selected
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 transition disabled:opacity-40"
            disabled={selected.size === 0 || isPending}
            onClick={() => mutateBulk({ action: 'enroll', uids: Array.from(selected) })}
          >
            Enroll
          </button>
          <button
            className="ml-2 px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 transition disabled:opacity-40"
            disabled={selected.size === 0 || isPending}
            onClick={() => mutateBulk({ action: 'deny', uids: Array.from(selected) })}
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}