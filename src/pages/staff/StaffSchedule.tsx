import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import StaffPageShell from './StaffPageShell';
import { staffService } from '../../services/staffService';
import { StaffAvailability, UpsertStaffAvailabilityRequest } from '../../types';

const DEFAULT_FORM = {
    startTime: '09:00',
    endTime: '10:00',
    isBlocked: false,
};

const DAYS = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
];

const sortAvailability = (items: StaffAvailability[]) =>
    [...items].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
            return a.dayOfWeek - b.dayOfWeek;
        }

        if (a.startTime !== b.startTime) {
            return a.startTime.localeCompare(b.startTime);
        }

        return a.endTime.localeCompare(b.endTime);
    });

const buildPayload = (dayOfWeek: number, form: typeof DEFAULT_FORM): UpsertStaffAvailabilityRequest => ({
    dayOfWeek,
    startTime: form.startTime,
    endTime: form.endTime,
    isBlocked: form.isBlocked,
});

const StaffSchedule = () => {
    const [availability, setAvailability] = useState<StaffAvailability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [drafts, setDrafts] = useState<Record<number, typeof DEFAULT_FORM>>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingForm, setEditingForm] = useState<typeof DEFAULT_FORM>(DEFAULT_FORM);

    const loadAvailability = async () => {
        setIsLoading(true);
        try {
            const data = await staffService.getAvailability();
            setAvailability(sortAvailability(data));
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'Không thể tải lịch rảnh lúc này.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadAvailability();
    }, []);

    const updateDraft = (dayOfWeek: number, partial: Partial<typeof DEFAULT_FORM>) => {
        setDrafts((current) => ({
            ...current,
            [dayOfWeek]: {
                ...(current[dayOfWeek] ?? DEFAULT_FORM),
                ...partial,
            },
        }));
    };

    const validateForm = (form: typeof DEFAULT_FORM) => {
        if (!form.startTime || !form.endTime) {
            return 'Vui lòng nhập đầy đủ giờ bắt đầu và giờ kết thúc.';
        }

        if (form.startTime >= form.endTime) {
            return 'Giờ kết thúc phải sau giờ bắt đầu.';
        }

        return null;
    };

    const handleCreate = async (dayOfWeek: number) => {
        const form = drafts[dayOfWeek] ?? DEFAULT_FORM;
        const validationMessage = validateForm(form);
        if (validationMessage) {
            setFeedback({ type: 'error', message: validationMessage });
            return;
        }

        setSavingKey(`create-${dayOfWeek}`);
        setFeedback(null);

        try {
            const created = await staffService.createAvailability(buildPayload(dayOfWeek, form));
            setAvailability((current) => sortAvailability([...current, created]));
            setDrafts((current) => ({
                ...current,
                [dayOfWeek]: DEFAULT_FORM,
            }));
            setFeedback({ type: 'success', message: `Đã thêm khung giờ cho ${DAYS[dayOfWeek].toLowerCase()}.` });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể thêm khung giờ.';
            setFeedback({ type: 'error', message });
        } finally {
            setSavingKey(null);
        }
    };

    const handleStartEdit = (item: StaffAvailability) => {
        setEditingId(item.id);
        setEditingForm({
            startTime: item.startTime,
            endTime: item.endTime,
            isBlocked: item.isBlocked,
        });
        setFeedback(null);
    };

    const handleUpdate = async (item: StaffAvailability) => {
        const validationMessage = validateForm(editingForm);
        if (validationMessage) {
            setFeedback({ type: 'error', message: validationMessage });
            return;
        }

        setSavingKey(`edit-${item.id}`);
        setFeedback(null);

        try {
            const updated = await staffService.updateAvailability(item.id, buildPayload(item.dayOfWeek, editingForm));
            setAvailability((current) =>
                sortAvailability(current.map((entry) => (entry.id === item.id ? updated : entry)))
            );
            setEditingId(null);
            setFeedback({ type: 'success', message: 'Đã cập nhật lịch rảnh.' });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể cập nhật khung giờ.';
            setFeedback({ type: 'error', message });
        } finally {
            setSavingKey(null);
        }
    };

    const handleDelete = async (item: StaffAvailability) => {
        setSavingKey(`delete-${item.id}`);
        setFeedback(null);

        try {
            await staffService.deleteAvailability(item.id);
            setAvailability((current) => current.filter((entry) => entry.id !== item.id));
            if (editingId === item.id) {
                setEditingId(null);
            }
            setFeedback({ type: 'success', message: 'Đã xóa khung giờ.' });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Không thể xóa khung giờ.';
            setFeedback({ type: 'error', message });
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <StaffPageShell
            title="Lịch rảnh của tôi"
            description="Cập nhật lịch làm việc theo tuần để hệ thống đồng bộ khung giờ khả dụng cho khách ở trang huấn luyện viên."
        >
            <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-slate-100 p-2">
                                <CalendarIcon className="text-slate-600" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Quản lý lịch rảnh theo tuần</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Khung giờ rảnh sẽ hiển thị cho khách trên trang chọn HLV. Khung giờ bận dùng để chặn một khoảng thời gian cụ thể trong ngày.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => void loadAvailability()}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Tải lại
                        </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Rảnh: khách có thể nhìn thấy slot</span>
                        <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">Bận: ẩn slot tương ứng khỏi khách</span>
                    </div>
                    {feedback && (
                        <div
                            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                                feedback.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                            }`}
                        >
                            {feedback.message}
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {isLoading ? (
                        <div className="p-6 text-sm text-slate-500">Đang tải lịch rảnh...</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {DAYS.map((day, dayOfWeek) => {
                                const dayAvailability = availability.filter((item) => item.dayOfWeek === dayOfWeek);
                                const draft = drafts[dayOfWeek] ?? DEFAULT_FORM;

                                return (
                                    <div key={day} className="p-4 sm:p-6">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                            <div className="w-full lg:w-40">
                                                <p className="text-base font-semibold text-slate-900">{day}</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {dayAvailability.length > 0
                                                        ? `${dayAvailability.length} khung giờ đã cấu hình`
                                                        : 'Chưa có khung giờ nào'}
                                                </p>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                {dayAvailability.length > 0 ? (
                                                    dayAvailability.map((item) => {
                                                        const isEditing = editingId === item.id;
                                                        const isBusy = savingKey === `edit-${item.id}` || savingKey === `delete-${item.id}`;

                                                        if (isEditing) {
                                                            return (
                                                                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                                                        <label className="text-sm font-medium text-slate-700">
                                                                            Giờ bắt đầu
                                                                            <input
                                                                                type="time"
                                                                                value={editingForm.startTime}
                                                                                onChange={(event) =>
                                                                                    setEditingForm((current) => ({
                                                                                        ...current,
                                                                                        startTime: event.target.value,
                                                                                    }))
                                                                                }
                                                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                                            />
                                                                        </label>
                                                                        <label className="text-sm font-medium text-slate-700">
                                                                            Giờ kết thúc
                                                                            <input
                                                                                type="time"
                                                                                value={editingForm.endTime}
                                                                                onChange={(event) =>
                                                                                    setEditingForm((current) => ({
                                                                                        ...current,
                                                                                        endTime: event.target.value,
                                                                                    }))
                                                                                }
                                                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                                            />
                                                                        </label>
                                                                        <label className="flex items-end">
                                                                            <select
                                                                                value={editingForm.isBlocked ? 'blocked' : 'available'}
                                                                                onChange={(event) =>
                                                                                    setEditingForm((current) => ({
                                                                                        ...current,
                                                                                        isBlocked: event.target.value === 'blocked',
                                                                                    }))
                                                                                }
                                                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                                            >
                                                                                <option value="available">Rảnh</option>
                                                                                <option value="blocked">Bận</option>
                                                                            </select>
                                                                        </label>
                                                                    </div>
                                                                    <div className="mt-4 flex flex-wrap gap-3">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void handleUpdate(item)}
                                                                            disabled={isBusy}
                                                                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                                        >
                                                                            <Save size={16} />
                                                                            {savingKey === `edit-${item.id}` ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingId(null)}
                                                                            disabled={isBusy}
                                                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                                                        >
                                                                            <X size={16} />
                                                                            Hủy
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                                                                    item.isBlocked
                                                                        ? 'border-rose-200 bg-rose-50'
                                                                        : 'border-emerald-200 bg-emerald-50'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`rounded-lg p-2 ${
                                                                            item.isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                        }`}
                                                                    >
                                                                        <Clock size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">
                                                                            {item.startTime} - {item.endTime}
                                                                        </p>
                                                                        <p
                                                                            className={`text-xs font-semibold uppercase tracking-wide ${
                                                                                item.isBlocked ? 'text-rose-700' : 'text-emerald-700'
                                                                            }`}
                                                                        >
                                                                            {item.isBlocked ? 'Đang bận' : 'Có thể nhận khách'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStartEdit(item)}
                                                                        disabled={isBusy}
                                                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        <Pencil size={16} />
                                                                        Sửa
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => void handleDelete(item)}
                                                                        disabled={isBusy}
                                                                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        {savingKey === `delete-${item.id}` ? 'Đang xóa...' : 'Xóa'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                                        Chưa có lịch cho ngày này. Thêm khung giờ bên dưới để khách nhìn thấy lịch khả dụng.
                                                    </div>
                                                )}

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                                                        <label className="text-sm font-medium text-slate-700">
                                                            Giờ bắt đầu
                                                            <input
                                                                type="time"
                                                                value={draft.startTime}
                                                                onChange={(event) => updateDraft(dayOfWeek, { startTime: event.target.value })}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                            />
                                                        </label>
                                                        <label className="text-sm font-medium text-slate-700">
                                                            Giờ kết thúc
                                                            <input
                                                                type="time"
                                                                value={draft.endTime}
                                                                onChange={(event) => updateDraft(dayOfWeek, { endTime: event.target.value })}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                            />
                                                        </label>
                                                        <label className="flex items-end">
                                                            <select
                                                                value={draft.isBlocked ? 'blocked' : 'available'}
                                                                onChange={(event) => updateDraft(dayOfWeek, { isBlocked: event.target.value === 'blocked' })}
                                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                            >
                                                                <option value="available">Rảnh</option>
                                                                <option value="blocked">Bận</option>
                                                            </select>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleCreate(dayOfWeek)}
                                                            disabled={savingKey === `create-${dayOfWeek}`}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <Plus size={16} />
                                                            {savingKey === `create-${dayOfWeek}` ? 'Đang thêm...' : 'Thêm khung giờ'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </StaffPageShell>
    );
};

export default StaffSchedule;
